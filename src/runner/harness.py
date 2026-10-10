"""The judge. Runs inside Pyodide in the browser's worker, and inside the Node
validator (scripts/problems/validate.mjs), which loads this exact file — so a
spec that validates is a spec that behaves the same in the app.

One entry point, `run(request_json, emit)`. The request carries the user's
code, the problem's raw spec.json text, and which tests to run; `emit` is a JS
callback handed one JSON string per event, so the main thread sees every case
the moment it finishes. That matters when a case hangs: the main thread may
have to kill the whole worker, and by then everything before the hang is
already on its side of the wall.

Events, in order:
    {"t": "start", "i": n, "limit": ms,    a case is about to call user code
     "input": [...]}
    {"t": "case", "r": {...}}              that case's result
and `run` returns one final JSON summary.

Values cross back to JS only as display strings, so a 10**18 in a test never
meets a JS double. Tests come in as the raw spec text for the same reason.
"""

import ast
import builtins
import functools
import io
import json
import linecache
import math
import random
import sys
import time
import traceback
from collections import namedtuple

USER_FILE = "solution.py"
REF_FILE = "reference.py"
JUDGE_FILE = "judge.py"

DEFAULT_LIMIT_MS = 4000
STDOUT_CAP = 16_000
DISPLAY_CAP = 600
FLOAT_TOL = 1e-5

# What LeetCode's Python 3 puts in scope without an import, near enough that
# code pasted from there runs here untouched. math is imported, never starred:
# math.pow would shadow the three-argument builtin.
PRELUDE = '''
from typing import *
from collections import *
from heapq import *
from bisect import *
from itertools import *
from functools import *
# After the star imports, so the module names win: `from bisect import *`
# alone would leave `bisect` meaning the function, and `bisect.insort(...)`
# — which works on LeetCode — would fail here.
import collections, heapq, bisect, math, itertools, functools, string, re, random, operator


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

    def __repr__(self):
        out, node, seen = [], self, set()
        while node is not None and id(node) not in seen and len(out) < 50:
            seen.add(id(node))
            out.append(repr(node.val))
            node = node.next
        tail = " -> ..." if node is not None else ""
        return "ListNode(" + " -> ".join(out) + tail + ")"


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

    def __repr__(self):
        return "TreeNode(" + repr(self.val) + ")"


class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []

    def __repr__(self):
        return "Node(" + repr(self.val) + ")"
'''



# --------------------------------------------------------------------------
# Memoisation without the C stack.
#
# functools' lru_cache is C. Every memoised call goes C -> Python -> C, and
# in Pyodide that eats the JS stack: a top-down DP about 700 levels deep
# kills the interpreter outright. Plain Python-to-Python calls don't touch
# the C stack at all, so a pure-Python wrapper recurses as deep as the
# recursion limit allows. Same interface, same eviction, slower by a constant.
# --------------------------------------------------------------------------

_CacheInfo = namedtuple("CacheInfo", ["hits", "misses", "maxsize", "currsize"])
_KW_MARK = object()
_MISS = object()


def _memoise(fn, maxsize, typed):
    memo = {}
    stats = [0, 0]
    bounded = maxsize is not None

    if maxsize == 0:
        def wrapper(*args, **kwargs):
            stats[1] += 1
            return fn(*args, **kwargs)
    elif not bounded:
        def wrapper(*args, **kwargs):
            key = args if not kwargs else args + (_KW_MARK,) + tuple(kwargs.items())
            if typed:
                key += tuple(type(a) for a in args)
            hit = memo.get(key, _MISS)
            if hit is not _MISS:
                stats[0] += 1
                return hit
            stats[1] += 1
            result = fn(*args, **kwargs) if kwargs else fn(*args)
            memo[key] = result
            return result
    else:
        def wrapper(*args, **kwargs):
            key = args if not kwargs else args + (_KW_MARK,) + tuple(kwargs.items())
            if typed:
                key += tuple(type(a) for a in args)
            hit = memo.pop(key, _MISS)
            if hit is not _MISS:
                memo[key] = hit  # most recent goes to the back
                stats[0] += 1
                return hit
            stats[1] += 1
            result = fn(*args, **kwargs) if kwargs else fn(*args)
            memo[key] = result
            if len(memo) > maxsize:
                del memo[next(iter(memo))]
            return result

    def cache_clear():
        memo.clear()
        stats[0] = stats[1] = 0

    wrapper.cache_info = lambda: _CacheInfo(stats[0], stats[1], maxsize, len(memo))
    wrapper.cache_clear = cache_clear
    wrapper.cache_parameters = lambda: {"maxsize": maxsize, "typed": typed}
    functools.update_wrapper(wrapper, fn)
    return wrapper


def lru_cache(maxsize=128, typed=False):
    if callable(maxsize) and not isinstance(maxsize, bool):  # bare @lru_cache
        return _memoise(maxsize, 128, typed)
    if maxsize is not None:
        if not isinstance(maxsize, int):
            raise TypeError("Expected first argument to be an integer, a callable, or None")
        maxsize = max(maxsize, 0)
    return lambda fn: _memoise(fn, maxsize, typed)


def cache(fn):
    return _memoise(fn, None, False)


functools.lru_cache = lru_cache
functools.cache = cache

# Every namespace starts as a copy of this one, so the user's code, the
# reference, the judge and the adapters below all share one ListNode class.
# Built after the swap above, so `cache` in scope is the pure-Python one.
_BASE = {"__name__": "prelude", "__builtins__": builtins}
exec(compile(PRELUDE, "<prelude>", "exec"), _BASE)
ListNode, TreeNode, Node = _BASE["ListNode"], _BASE["TreeNode"], _BASE["Node"]


# --------------------------------------------------------------------------
# Plain data <-> the structures problems take and return.
#
# Freeing a long chain of nodes is a chain of nested deallocations, and in
# Pyodide each one is a few frames of the JS stack: drop a 5,000-node list
# and the interpreter dies (CPython's trashcan, which normally flattens this,
# doesn't engage under wasm). So every node the harness builds or walks is
# recorded in an arena, and at the end of each case `teardown` strips their
# links one node at a time — each then frees on its own, nothing nests.
# --------------------------------------------------------------------------

_arena = []


def track(*nodes):
    """Register nodes a judge builds itself, so teardown takes them apart."""
    _arena.extend(nodes)


def teardown():
    for node in _arena:
        d = getattr(node, "__dict__", None)
        if d is not None:
            d.clear()
    _arena.clear()


def to_list_node(values):
    head = tail = None
    for v in values or []:
        node = ListNode(v)
        _arena.append(node)
        if tail is None:
            head = tail = node
        else:
            tail.next = node
            tail = node
    return head


def from_list_node(head, limit=100_000):
    out, seen = [], set()
    while head is not None:
        if id(head) in seen:
            raise ValueError("the returned list has a cycle")
        if len(out) >= limit:
            raise ValueError("the returned list is longer than " + str(limit) + " nodes")
        seen.add(id(head))
        _arena.append(head)
        out.append(head.val)
        head = head.next
    return out


def to_tree(values):
    """LeetCode's level order: [3,9,20,null,null,15,7]."""
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    _arena.append(root)
    queue, head, i, n = [root], 0, 1, len(values)
    while head < len(queue) and i < n:
        node = queue[head]
        head += 1
        if values[i] is not None:
            node.left = TreeNode(values[i])
            queue.append(node.left)
            _arena.append(node.left)
        i += 1
        if i < n and values[i] is not None:
            node.right = TreeNode(values[i])
            queue.append(node.right)
            _arena.append(node.right)
        i += 1
    return root


def from_tree(root, limit=100_000):
    if root is None:
        return []
    out, queue, head, seen = [], [root], 0, set()
    while head < len(queue):
        node = queue[head]
        head += 1
        if node is None:
            out.append(None)
            continue
        if id(node) in seen:
            raise ValueError("the returned tree has a cycle or a shared node")
        if len(seen) >= limit:
            raise ValueError("the returned tree has more than " + str(limit) + " nodes")
        seen.add(id(node))
        _arena.append(node)
        out.append(node.val)
        queue.append(node.left)
        queue.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out


def find_node(root, val):
    """First node holding `val`, breadth first — for problems that hand you
    nodes of a tree you were also given (LCA and friends)."""
    queue = [root]
    for node in queue:
        if node is None:
            continue
        if node.val == val:
            return node
        queue.append(node.left)
        queue.append(node.right)
    return None


_TO = {
    "ListNode": to_list_node,
    "TreeNode": to_tree,
    "ListNode[]": lambda xs: [to_list_node(x) for x in xs],
    "TreeNode[]": lambda xs: [to_tree(x) for x in xs],
}

_FROM = {
    "ListNode": from_list_node,
    "TreeNode": from_tree,
    "ListNode[]": lambda xs: [from_list_node(x) for x in xs],
    "TreeNode[]": lambda xs: [from_tree(x) for x in xs],
}


def adapt_in(value, kind):
    return _TO[kind](value) if kind in _TO else value


def adapt_out(value, kind):
    if kind in _FROM:
        if kind.endswith("[]") and value is not None and not isinstance(value, (list, tuple)):
            raise TypeError("expected a list of " + kind[:-2] + " objects")
        return _FROM[kind](value) if value is not None or not kind.endswith("[]") else []
    return value


# --------------------------------------------------------------------------
# Equality, display.
# --------------------------------------------------------------------------

def plain(x, depth=0):
    """What a result means as data: tuples are lists, sets are sorted lists.
    Anything else that isn't JSON-shaped is left alone and fails honestly."""
    if depth > 200:
        return x
    if isinstance(x, (list, tuple)):
        return [plain(v, depth + 1) for v in x]
    if isinstance(x, (set, frozenset)):
        return sorted((plain(v, depth + 1) for v in x), key=sort_key)
    if isinstance(x, dict):
        return {k: plain(v, depth + 1) for k, v in x.items()}
    return x


def sort_key(x):
    """A total order over plain values, rounding floats so 0.1+0.2 and 0.3
    land in the same slot when an unordered comparison sorts both sides."""
    def norm(v):
        if isinstance(v, bool) or v is None or isinstance(v, str):
            return v
        if isinstance(v, int):
            return v
        if isinstance(v, float):
            return round(v, 6) if math.isfinite(v) else str(v)
        if isinstance(v, list):
            return [norm(e) for e in v]
        if isinstance(v, dict):
            return {str(k): norm(e) for k, e in v.items()}
        return repr(v)
    try:
        return json.dumps(norm(x), sort_keys=True)
    except (TypeError, ValueError):
        return repr(x)


def same(a, b):
    """Deep equality with float tolerance. bool and int are told apart:
    returning 1 where true was expected is a wrong answer, as on LeetCode."""
    if isinstance(a, bool) or isinstance(b, bool):
        return isinstance(a, bool) and isinstance(b, bool) and a == b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        if isinstance(a, int) and isinstance(b, int):
            return a == b
        if math.isnan(a) or math.isnan(b):
            return math.isnan(a) and math.isnan(b)
        return abs(a - b) <= FLOAT_TOL or abs(a - b) <= FLOAT_TOL * max(abs(a), abs(b))
    if isinstance(a, list) and isinstance(b, list):
        return len(a) == len(b) and all(same(x, y) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(same(a[k], b[k]) for k in a)
    return type(a) is type(b) and a == b


def compare(got, expected, mode):
    if mode == "exact":
        return same(got, expected)
    if not isinstance(got, list) or not isinstance(expected, list):
        return same(got, expected)
    if mode == "unordered":
        return same(sorted(got, key=sort_key), sorted(expected, key=sort_key))
    if mode == "unordered-deep":
        def inner(xs):
            return sorted(
                (sorted(x, key=sort_key) if isinstance(x, list) else x for x in xs),
                key=sort_key,
            )
        return same(inner(got), inner(expected))
    raise ValueError("unknown compare mode: " + repr(mode))


def show(x, cap=DISPLAY_CAP):
    """LeetCode's display style: compact JSON, null/true/false. A value too
    long to read is cut, and says how big it really was."""
    try:
        s = json.dumps(x, separators=(",", ":"), ensure_ascii=False, allow_nan=True)
    except (TypeError, ValueError):
        s = repr(x)
    if len(s) > cap:
        size = (" (" + format(len(x), ",") + " items)") if isinstance(x, (list, dict, str)) else ""
        s = s[:cap] + " …" + size
    return s


def fresh(x):
    """An independent copy of plain data, so no call can mutate the next one's
    input. A JSON round trip beats deepcopy on big lists of numbers."""
    try:
        return json.loads(json.dumps(x))
    except (TypeError, ValueError):
        import copy
        return copy.deepcopy(x)


# --------------------------------------------------------------------------
# Running somebody's code.
# --------------------------------------------------------------------------

class _Capped(io.TextIOBase):
    def __init__(self, cap=STDOUT_CAP):
        self.parts, self.size, self.cap, self.cut = [], 0, cap, False

    def writable(self):
        return True

    def write(self, s):
        s = str(s)
        if self.size < self.cap:
            room = self.cap - self.size
            self.parts.append(s[:room])
            if len(s) > room:
                self.cut = True
        else:
            self.cut = self.cut or bool(s)
        self.size += len(s)
        return len(s)

    def text(self):
        out = "".join(self.parts)
        if self.cut:
            out += "\n… output truncated at " + str(self.cap) + " characters"
        return out


class _Capture:
    def __enter__(self):
        self.buf = _Capped()
        self.saved = sys.stdout, sys.stderr
        sys.stdout = sys.stderr = self.buf
        return self.buf

    def __exit__(self, *exc):
        sys.stdout, sys.stderr = self.saved
        return False


def _no_input(*_args):
    raise RuntimeError("input() isn't available here: the tests call your function with arguments")


def namespace(name):
    ns = dict(_BASE)
    ns["__name__"] = name
    ns["input"] = _no_input
    return ns


def _register_source(filename, src):
    linecache.cache[filename] = (len(src), None, src.splitlines(True), filename)


def _filter(te, filename, seen=None):
    """Drop every frame that isn't the user's, through the whole chain."""
    seen = set() if seen is None else seen
    if te is None or id(te) in seen:
        return
    seen.add(id(te))
    te.stack = traceback.StackSummary.from_list(
        [f for f in te.stack if f.filename == filename]
    )
    _filter(te.__cause__, filename, seen)
    _filter(te.__context__, filename, seen)
    for sub in getattr(te, "exceptions", None) or []:
        _filter(sub, filename, seen)


def release(e):
    """Free an exception's traceback without a deep free.

    A RecursionError at depth 100,000 drags a 100,000-link traceback behind
    it, each link holding a frame whose f_back holds the next. Dropped as is,
    that's 100,000 nested deallocations — which, like the long node chains
    above, kills Pyodide outright. So: unlink every traceback, then let them
    go innermost first, so each frame dies while the frame outside it is
    still held and nothing nests. Must run before the `except` block ends."""
    seen, pending = set(), [e]
    while pending:
        x = pending.pop()
        if x is None or id(x) in seen:
            continue
        seen.add(id(x))
        links = []
        tb = x.__traceback__
        while tb is not None:
            links.append(tb)
            tb = tb.tb_next
        x.__traceback__ = None
        for tb in links:
            tb.tb_next = None
        # The loop variable still holds the innermost link, and through its
        # frame's f_back the whole chain: drop it before popping, or the
        # chain is freed the deep way when this function returns.
        tb = None
        while links:
            links.pop()
        pending.append(x.__cause__)
        pending.append(x.__context__)


DEEP = 200


def _deep_traceback(e, links, filename):
    """A traceback for a stack too deep to hand to the traceback module
    (100,000 FrameSummaries cost seconds): the user's frames, consecutive
    repeats collapsed the way CPython collapses them, long runs elided."""
    lines, last, count = [], None, 0

    def flush():
        if count > 1:
            lines.append("  [Previous line repeated " + format(count - 1, ",") + " more times]")

    for tb in links:
        code = tb.tb_frame.f_code
        if code.co_filename != filename:
            continue
        key = (tb.tb_lineno, code.co_name)
        if key == last:
            count += 1
            continue
        flush()
        last, count = key, 1
        lines.append('  File "' + filename + '", line ' + str(tb.tb_lineno) + ", in " + code.co_name)
        src = linecache.getline(filename, tb.tb_lineno).strip()
        if src:
            lines.append("    " + src)
    flush()
    if len(lines) > 30:
        lines = lines[:12] + ["  … " + format(len(lines) - 24, ",") + " lines omitted …"] + lines[-12:]
    head = "Traceback (most recent call last, " + format(len(links), ",") + " frames deep):"
    tail = "".join(traceback.format_exception_only(type(e), e)).rstrip()
    return "\n".join([head] + lines + [tail])


def describe_error(e, filename=USER_FILE):
    links = []
    tb = e.__traceback__
    while tb is not None:
        links.append(tb)
        tb = tb.tb_next
    line = None
    for link in links:
        if link.tb_frame.f_code.co_filename == filename:
            line = link.tb_lineno
    if isinstance(e, SyntaxError) and e.filename == filename:
        line = e.lineno
    if len(links) > DEEP:
        text = _deep_traceback(e, links, filename)
    else:
        te = traceback.TracebackException.from_exception(e, capture_locals=False)
        _filter(te, filename)
        text = "".join(te.format()).rstrip()
        te = None
    link = None
    links = None
    message = "".join(traceback.format_exception_only(type(e), e)).strip().splitlines()[-1]
    hint = None
    if isinstance(e, RecursionError):
        hint = "Recursion went deeper than " + format(sys.getrecursionlimit(), ",") + " calls — a base case that never fires, most likely."
    release(e)
    return {
        "type": type(e).__name__,
        "message": message,
        "line": line,
        "traceback": text,
        "hint": hint,
    }


def load_module(src, filename, name):
    _register_source(filename, src)
    code = compile(src, filename, "exec")
    ns = namespace(name)
    exec(code, ns)
    return ns


def snake(name):
    out = []
    for ch in name:
        if ch.isupper() and out:
            out.append("_")
        out.append(ch.lower())
    return "".join(out)


def resolve(ns, spec, who="your code"):
    """What the tests aim at: the design class, or a maker that hands back a
    fresh bound method per case — LeetCode builds a new Solution() for every
    test, so state left on `self` never leaks from one case to the next."""
    if spec.get("kind") == "design":
        cls_name = spec["className"]
        target = ns.get(cls_name)
        if not isinstance(target, type):
            raise LookupError("Couldn't find `class " + cls_name + "` in " + who + ".")
        return target
    entry = spec["entry"]
    sol = ns.get("Solution")
    if isinstance(sol, type):
        name = next((n for n in (entry, snake(entry)) if callable(getattr(sol, n, None))), None)
        if name is None:
            raise LookupError("`class Solution` has no `" + entry + "` method in " + who + ".")

        def make():
            return getattr(sol(), name)

        try:
            make()
        except TypeError as e:
            raise LookupError("`Solution()` has to construct with no arguments: " + str(e))
        return make
    for name in (entry, snake(entry)):
        fn = ns.get(name)
        if callable(fn):
            return lambda: fn
    raise LookupError("Couldn't find `class Solution` with a `" + entry + "` method in " + who + ".")


# --------------------------------------------------------------------------
# One test.
# --------------------------------------------------------------------------

def _gen_namespace():
    ns = namespace("generator")
    ns["rng"] = random.Random
    return ns


def case_args(case, spec, gen_ns):
    """The plain-data arguments of a case: literal, generated, or typed in."""
    if "argsPy" in case:
        src = case["argsPy"]
        try:
            args = eval(compile(src, "<argsPy>", "eval"), gen_ns)
        except SyntaxError:
            scope = dict(gen_ns)
            exec(compile(src, "<argsPy>", "exec"), scope)
            if "args" not in scope:
                raise ValueError("argsPy statements must assign `args`")
            args = scope["args"]
        if spec.get("kind") == "design":
            if not isinstance(args, dict) or "ops" not in args or "args" not in args:
                raise ValueError("argsPy for a design problem must build {'ops': [...], 'args': [...]}")
            return args
        if not isinstance(args, (list, tuple)):
            raise ValueError("argsPy must build a list with one entry per parameter")
        return list(args)
    if spec.get("kind") == "design":
        return {"ops": case["ops"], "args": case["args"]}
    return case["args"]


def parse_literal(text):
    text = text.strip()
    try:
        return json.loads(text)
    except ValueError:
        return ast.literal_eval(text)


def display_input(args, spec):
    if spec.get("kind") == "design":
        return ["ops = " + show(args["ops"]), "args = " + show(args["args"])]
    names = [p["name"] for p in spec["params"]]
    return [n + " = " + show(a) for n, a in zip(names, args)]


def call_function(make, args, spec, judge):
    """Runs one function-problem call; returns the result as plain data."""
    params = spec["params"]
    fn = make()
    if judge is not None and callable(judge.get("run")):
        return plain(judge["run"](fn, fresh(args)))
    built = [adapt_in(fresh(a), p.get("type")) for a, p in zip(args, params)]
    result = fn(*built)
    mutates = spec.get("mutates")
    if mutates is not None:
        k = next(i for i, p in enumerate(params) if p["name"] == mutates)
        return plain(adapt_out(built[k], params[k].get("type")))
    return plain(adapt_out(result, spec.get("returns")))


class _OpError(Exception):
    def __init__(self, k, op, inner, partial):
        super().__init__(str(inner))
        self.k, self.op, self.inner, self.partial = k, op, inner, partial


def call_design(cls, args, spec, judge):
    ops, a = args["ops"], fresh(args["args"])
    if judge is not None and callable(judge.get("run_design")):
        return plain(judge["run_design"](cls, ops, a))
    if len(ops) != len(a):
        raise ValueError("ops and args differ in length")
    out, obj = [], None
    for k, (op, xs) in enumerate(zip(ops, a)):
        try:
            if k == 0:
                obj = cls(*xs)
                out.append(None)
            else:
                out.append(plain(getattr(obj, op)(*xs)))
        except Exception as e:
            raise _OpError(k, op, e, out) from e
    return out


def judge_verdict(got, expected, args, spec, judge):
    """(passed, message)."""
    if judge is not None and callable(judge.get("check")):
        verdict = judge["check"](got, expected, fresh(args))
        if verdict is True:
            return True, None
        return False, (verdict if isinstance(verdict, str) else None)
    if spec.get("kind") == "design":
        if not isinstance(got, list) or len(got) != len(expected):
            return False, None
        ops, xs = args["ops"], args["args"]
        for k, (g, e) in enumerate(zip(got, expected)):
            if not same(g, e):
                call = ops[k] + "(" + ", ".join(show(v, 80) for v in xs[k]) + ")"
                return False, "Call #" + str(k) + " " + call + " returned " + show(g, 200) + ", expected " + show(e, 200) + "."
        return True, None
    return compare(got, expected, spec.get("compare", "exact")), None


def run_case(i, case, ctx):
    try:
        return _run_case(i, case, ctx)
    finally:
        teardown()


def _run_case(i, case, ctx):
    spec = ctx["spec"]
    res = {"i": i, "ms": 0, "label": case.get("label"), "perf": bool(case.get("perf"))}
    if case.get("custom"):
        res["custom"] = True
    try:
        args = ctx["args"][i]
    except Exception as e:  # a generated or typed-in input that didn't build
        res["status"] = "invalid"
        res["message"] = "This input didn't parse: " + str(e)
        res["input"] = case.get("display") or []
        release(e)
        return res
    res["input"] = display_input(args, spec)

    expected = case.get("expected", _MISS)
    if expected is _MISS:
        expected = ctx["reference_for"](args)
        if isinstance(expected, dict) and expected.get("__invalid__"):
            res["refError"] = expected["message"]
            expected = _MISS
    if expected is not _MISS:
        res["expected"] = show(expected)

    limit = case.get("timeLimitMs") or spec.get("timeLimitMs") or DEFAULT_LIMIT_MS
    ctx["emit"](json.dumps({"t": "start", "i": i, "limit": limit, "input": res["input"]}))

    target, judge = ctx["target"], ctx["judge"]
    got = _MISS
    with _Capture() as out:
        t0 = time.perf_counter()
        try:
            if spec.get("kind") == "design":
                got = call_design(target, args, spec, judge)
            else:
                got = call_function(target, args, spec, judge)
            res["ms"] = round((time.perf_counter() - t0) * 1000, 1)
        except KeyboardInterrupt as e:
            res["ms"] = round((time.perf_counter() - t0) * 1000, 1)
            res["status"] = "interrupted"
            release(e)
        except _OpError as e:
            res["ms"] = round((time.perf_counter() - t0) * 1000, 1)
            res["status"] = "error"
            res["error"] = describe_error(e.inner)
            res["got"] = show(e.partial)
            res["message"] = "Raised during call #" + str(e.k) + " (" + str(e.op) + ")."
            release(e)
        except (Exception, SystemExit) as e:
            res["ms"] = round((time.perf_counter() - t0) * 1000, 1)
            res["status"] = "error"
            res["error"] = describe_error(e)
    res["stdout"] = out.text()

    if "status" in res:
        return res
    res["got"] = show(got)
    if expected is _MISS:
        res["status"] = "ran"  # a typed-in case the reference couldn't answer
        return res
    try:
        ok, message = judge_verdict(got, expected, args, spec, judge)
    except Exception as e:
        res["status"] = "error"
        res["error"] = describe_error(e, JUDGE_FILE)
        res["message"] = "The checker itself failed on your output."
        return res
    res["status"] = "pass" if ok else "fail"
    if message:
        res["message"] = message
    return res


# --------------------------------------------------------------------------
# The entry point.
# --------------------------------------------------------------------------

def _reference_for(spec, ref_target, judge):
    def answer(args):
        if ref_target is None:
            return {"__invalid__": True, "message": "No reference solution to compute the expected output."}
        try:
            with _Capture():
                if spec.get("kind") == "design":
                    return call_design(ref_target, args, spec, judge)
                return call_function(ref_target, args, spec, judge)
        except KeyboardInterrupt:
            raise
        except _OpError as e:
            msg = "The reference solution rejected this input at call #" + str(e.k) + ": " + str(e.inner)
            release(e)
            return {"__invalid__": True, "message": msg}
        except Exception as e:
            msg = "The reference solution rejected this input: " + type(e).__name__ + ": " + str(e)
            release(e)
            return {"__invalid__": True, "message": msg}
    return answer


def run(request_json, emit):
    started = time.perf_counter()
    req = json.loads(request_json)
    spec = json.loads(req["spec"])
    code = req["code"]
    summary = {"results": [], "ms": 0}

    sys.setrecursionlimit(100_000)

    # The cases this run asked for: spec tests by index, then typed-in ones.
    tests = spec.get("tests", [])
    cases = [tests[k] for k in req.get("select", [])]
    for c in req.get("custom", []):
        cases.append({"custom": True, "fields": c})

    # The user's module. A syntax error or a top-level crash ends the run here.
    try:
        with _Capture() as out:
            user_ns = load_module(code, USER_FILE, "solution")
        summary["stdout"] = out.text()
    except KeyboardInterrupt:
        summary["interrupted"] = True
        return json.dumps(summary)
    except (Exception, SystemExit) as e:
        summary["compileError"] = describe_error(e)
        summary["ms"] = round((time.perf_counter() - started) * 1000, 1)
        return json.dumps(summary)

    try:
        target = resolve(user_ns, spec)
    except LookupError as e:
        summary["entryError"] = str(e)
        return json.dumps(summary)

    judge = None
    if req.get("judge"):
        judge = load_module(req["judge"], JUDGE_FILE, "judge")
        judge.update({
            "to_list_node": to_list_node, "from_list_node": from_list_node,
            "to_tree": to_tree, "from_tree": from_tree, "find_node": find_node,
            "track": track, "same": same, "show": show, "plain": plain,
        })

    ref_target = None
    if req.get("reference"):
        try:
            ref_target = resolve(load_module(req["reference"], REF_FILE, "reference"), spec, "the reference")
        except Exception:
            ref_target = None

    gen_ns = _gen_namespace()
    names = (["ops", "args"] if spec.get("kind") == "design"
             else [p["name"] for p in spec.get("params", [])])
    built = {}
    for i, c in enumerate(cases):
        try:
            if c.get("custom"):
                fields = c["fields"]
                values = [parse_literal(fields.get(n, "")) for n in names]
                built[i] = ({"ops": values[0], "args": values[1]}
                            if spec.get("kind") == "design" else values)
            else:
                built[i] = case_args(c, spec, gen_ns)
        except Exception as e:
            c["display"] = [n + " = " + str(c.get("fields", {}).get(n, "")) for n in names] if c.get("custom") else []
            built[i] = _Bad(Exception(type(e).__name__ + ": " + str(e)))
            release(e)

    ctx = {
        "spec": spec, "target": target, "judge": judge, "emit": emit,
        "args": _Args(built), "reference_for": _reference_for(spec, ref_target, judge),
    }

    try:
        for i, c in enumerate(cases):
            r = run_case(i, c, ctx)
            summary["results"].append(r)
            emit(json.dumps({"t": "case", "r": r}))
            if r.get("status") == "interrupted":
                summary["interrupted"] = True
                break
    except KeyboardInterrupt:
        summary["interrupted"] = True

    summary["ms"] = round((time.perf_counter() - started) * 1000, 1)
    return json.dumps(summary)


class _Bad:
    def __init__(self, e):
        self.e = e


class _Args:
    """Index into the built inputs, re-raising whatever broke one."""
    def __init__(self, built):
        self.built = built

    def __getitem__(self, i):
        v = self.built[i]
        if isinstance(v, _Bad):
            raise v.e
        return v
