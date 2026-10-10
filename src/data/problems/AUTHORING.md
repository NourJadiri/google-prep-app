# Writing a problem

Every problem the app can run lives in its own directory here, named by its
id — the LeetCode slug (`two-sum`), or the drill id for a premium stand-in
(`design-hit-counter`). The workspace shows `statement.md` on the left, puts
`spec.json`'s starter in the editor, runs `spec.json`'s tests through
`src/runner/harness.py` in Pyodide (CPython 3.14 in the browser), and keeps
`solution.py` + `notes.md` behind the Solution tab until the reader asks.

```
two-sum/
  statement.md   the problem, in our own words           (required)
  spec.json      signature, starter code, tests           (required)
  solution.py    the reference solution — shown to users  (required)
  notes.md       the walkthrough shown with the solution  (required)
  brute.py       an independent, simple solution          (strongly expected)
  wrong.py       a plausible bug the tests must catch     (recommended)
  judge.py       custom input building / checking         (only when needed)
```

Look at the four worked examples before writing anything:
`two-sum` (plain function, unordered answer), `reverse-linked-list`
(ListNode in and out), `linked-list-cycle` (a judge that builds the input),
`design-hit-counter` (a design class, plus a judge for a big generated test).

## The one rule about wording

**Never copy LeetCode's text, examples, or explanations.** Same task, our own
words: restate it from scratch, invent fresh examples, write the constraints
yourself (same limits are fine — numbers aren't prose). A one-line story frame
is welcome when it makes the task clearer ("a podcast company rents identical
studios…"), never at the cost of precision. Keep LeetCode's **method and
parameter names** (`twoSum(nums, target)`), so code moves between the two
sites unchanged.

## Validate as you go

```bash
node scripts/problems/validate.mjs two-sum            # one or more ids
```

It runs `solution.py` against every test in the real interpreter, checks that
the starter fails, that `brute.py` agrees on every non-perf test, that
`wrong.py` is caught, and that a shown example typed back into the Testcase tab
reproduces itself. A problem isn't done until it prints `ok`. Warnings are
worth fixing too.

Write `spec.json` with the formatter (tests one per line):

```python
import sys; sys.path.insert(0, "scripts/problems")
from specfmt import dump
dump(spec, "src/data/problems/two-sum/spec.json")
```

Keep your generator scripts out of the repo (a scratch directory is fine) —
only the files listed above belong in a problem directory.

## statement.md

~~~markdown
# Two Sum

## The task
…exactly what the input is, exactly what to return, every rule that matters.

## Examples

**Example 1**

```
nums = [4,9,2,6], target = 10   -> [0,3]
```

One or two sentences on why.

## Constraints

- `2 <= nums.length <= 10^4`

## Aim for
Target complexity and the shape of the approach. Shown folded, as a hint.

## Follow-ups
- Two or three things an interviewer asks next.
~~~

- Line one is `# Title`. Anything between it and the first `##` (a lead line,
  e.g. the premium note) is skipped by the reader — the header already shows
  the title, difficulty and LeetCode link.
- Required sections: `## The task`, `## Examples`, `## Constraints`.
  Recommended: `## Aim for`, `## Follow-ups`. Nothing else.
- Examples: 2–3, each `**Example k**` then a fenced block in the form
  `name = value, name = value   -> output`, values in JSON style (`null`,
  `true`, double-quoted strings). **The examples must be exactly the tests
  marked `"show": true`, in the same order.**
- Linked lists and trees are written as arrays: lists front to back, trees in
  LeetCode's level order with `null` gaps (`[3,9,20,null,null,15,7]`). Say so
  in The task the first time a problem takes one.
- Design problems: show an example as the `ops` / `args` pair the tests use
  (see `design-hit-counter`), and say in The task that the expected output has
  one entry per operation, `null` for the constructor and for methods that
  return nothing.
- Markdown dialect: paragraphs, `-` bullets, `1.` numbered lists, fenced code
  blocks, `inline code`, **bold**, *italic*. No tables, images, links or HTML.
- Write `10^4`, not `10⁴`; `<=`, not `≤`.

## spec.json

### A function problem

```json
{
  "id": "two-sum",
  "title": "Two Sum",
  "difficulty": "E",
  "lc": {"num": 1, "slug": "two-sum"},
  "topics": ["array", "hash map"],
  "kind": "function",
  "entry": "twoSum",
  "params": [{"name": "nums"}, {"name": "target"}],
  "compare": "unordered",
  "starter": "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass\n",
  "tests": [
    {"args": [[4, 9, 2, 6], 10], "expected": [0, 3], "show": true},
    {"args": [[1, 2], 3], "expected": [0, 1], "label": "smallest input"},
    {"argsPy": "[list(range(1, 9999)) + [10**8, 10**8 + 1], 2 * 10**8 + 1]", "expected": [9998, 9999], "label": "large", "perf": true}
  ]
}
```

| field | meaning |
| --- | --- |
| `id` | the directory name |
| `title` | display title |
| `difficulty` | `E`, `M` or `H` — LeetCode's label |
| `lc` | `{"num": 1, "slug": "two-sum"}`; premium stand-ins: `{"num": 362, "premium": true}` and no slug |
| `topics` | 1–4 short lowercase tags |
| `kind` | `function` or `design` |
| `entry` | the `Solution` method the tests call (function problems) |
| `params` | one `{"name": …}` per argument, in order; add `"type"` to convert (below) |
| `returns` | a conversion type for the return value (below), omitted for plain data |
| `mutates` | a param name: the function returns nothing and the tests compare that argument after the call (`moveZeroes`, `merge`) |
| `compare` | `exact` (default), `unordered` (order of the top-level list doesn't matter), `unordered-deep` (neither does the order inside each inner list) |
| `className` | the class the tests construct (design problems) |
| `timeLimitMs` | per-test limit, default 4000 — rarely worth changing |
| `starter` | what the editor opens with (below) |
| `tests` | the tests (below) |

**Conversion types**, for `params[].type` and `returns`: `ListNode`,
`TreeNode`, `ListNode[]`, `TreeNode[]`. The test data stays plain arrays; the
harness builds the nodes going in and flattens what comes back (a `None`
list or tree comes back as `[]`).

Floats always compare with a 1e-5 tolerance. `true` never equals `1`.
Tuples compare as lists; sets as sorted lists.

### A design problem

```json
{
  "kind": "design",
  "className": "HitCounter",
  "starter": "class HitCounter:\n\n    def __init__(self):\n        pass\n\n    def record(self, t: int) -> None:\n        pass\n\n    def count(self, t: int) -> int:\n        pass\n",
  "tests": [
    {"ops": ["HitCounter", "record", "count"], "args": [[], [5], [5]], "expected": [null, null, 1], "show": true}
  ]
}
```

`ops[0]` is the constructor. `expected` has one entry per op. A mismatch is
reported as the first call whose return value differs.

### Starter code

- Function problems: `class Solution:` with the entry method, LeetCode-style
  type hints, body `pass`. `List`, `Optional`, `ListNode`, `TreeNode`,
  `collections`, `heapq`, `bisect`, `math`, `itertools`, `functools` (and
  their contents) are already in scope, as on LeetCode.
- Problems taking `ListNode`/`TreeNode`: open with LeetCode's commented-out
  class definition (see `reverse-linked-list`).
- Design problems: the class with every method stubbed with `pass`.

### Tests

- **15–30 tests.** Cover: the shown examples (2–4, `"show": true`, literal
  `args`), the smallest legal input, every boundary in the constraints,
  duplicates, negatives/zeros where legal, all-equal, already-sorted and
  reverse-sorted, the "trap" cases from your Pitfalls, a handful of seeded
  random cases, and 1–2 large cases (`"perf": true`).
- Give non-shown tests a short `"label"` ("empty list", "one node pointing at
  itself", "large: pair at the end") — it's shown next to a failure.
- **Every `expected` comes from running code, never from your head.** Compute
  it with your reference and confirm with `brute.py` (the validator does the
  confirming).
- **Answers must be unique, or the comparison must accept every right one.**
  If the problem allows any order, use `compare`. If it allows genuinely
  different answers (any valid topological order, any index of a peak, any
  arrangement), write a `check` in `judge.py`. Otherwise, choose inputs whose
  answer is unique — and check that you did (the brute force will tell you).
- **Respect the constraints** you wrote. If a large case would need inputs
  bigger than you'd like to store, generate it with `argsPy`.
- **Large inputs:** `argsPy` is a Python expression (or statements ending in
  an assignment to `args`) that builds the argument list — `{"ops", "args"}`
  for design problems. It runs with the usual scope plus `rng(seed)` (a
  seeded `random.Random`); always seed. `expected` stays literal; if that
  would be huge, set it to `null` and compute it in `judge.py`'s `check` (see
  `design-hit-counter`). Keep each `spec.json` under ~150 KB.
- **Perf tests should separate good from bad.** Size them so the intended
  complexity runs in well under a second (the validator fails anything over a
  third of the limit) while the naive approach would blow the 4 s limit —
  Pyodide runs Python about 2–3× slower than native CPython.
- **Depth.** The interpreter runs on the browser's stack. Plain recursion is
  fine past 10,000 levels and `@cache` is replaced with a pure-Python version
  that is too, but recursion that passes through a generator expression,
  `map()` or `sorted(key=…)` crashes at roughly 500 levels. Keep the
  recursion depth a natural solution needs on your inputs **≤ 1,000**: skewed
  trees and linked-list recursion up to 1,000 nodes; balanced and random trees
  can be much larger. User-defined structures (trie nodes, a design's own
  node class) should stay under ~1,000 deep too — e.g. trie words ≤ 300
  characters. ListNode and TreeNode chains the harness builds are taken apart
  safely at any length.

## judge.py (only when needed)

A module with any of these functions; everything from the starter scope is
available, plus `to_list_node`, `from_list_node`, `to_tree`, `from_tree`,
`find_node(root, val)`, `track(*nodes)`, `same(a, b)` (the tolerant
equality), `show(x)` and `plain(x)`.

```python
def run(fn, args):              # function problems: build the call yourself
    ...                          # fn is the user's bound method; args the test's plain args
    return result_as_plain_data  # `returns` conversion is skipped when run() exists

def run_design(cls, ops, args): # design problems: drive the object yourself
    ...
    return outputs_list

def check(got, expected, args): # decide pass/fail yourself
    return True                 # True passes; a string fails with that message; anything else fails
```

`got` arrives as plain data (after conversions), `args` as the test's plain
arguments (a fresh copy). Typical uses: building a cycle or an intersection
(`run`), handing in nodes of a tree you were given (`run` + `find_node`),
accepting any valid order (`check`), statistical checks for randomised design
problems (`run_design` that calls many times and returns a verdict you then
`check`). Nodes you build yourself without the helpers: pass them to `track`.

## solution.py — the reference

What a strong candidate would write: optimal, idiomatic, readable, in the
starter's exact shape. Comments only where they teach (the invariant, the
reason for an order of operations) — users read this file after solving.

## brute.py and wrong.py

`brute.py`: the most obviously-correct implementation you can write, however
slow (it skips perf tests). It's what makes every `expected` trustworthy, so
write it independently of the reference — not a copy with one line changed.

`wrong.py`: the bug a real candidate makes (off-by-one window, comparing
values instead of nodes, forgetting duplicates). The validator insists the
tests catch it.

## notes.md

```markdown
## Approach
The idea, then the mechanics, then why it's correct. Name the pattern.

## Complexity
Time and space, with the reason.

## Pitfalls
- The two or three mistakes people actually make.
```

`## Approach` and `## Complexity` are required. Teach — this is what the
reader opens after struggling.
