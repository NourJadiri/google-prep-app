# Any alphabet consistent with the list is accepted, so the answer is checked
# against the list itself rather than compared with one stored string. The
# expected value in the spec is just one valid answer, for display.


def _rules(words):
    """The ordering rules the list implies, each with the adjacent pair that
    gave it, or a prefix violation as (None, (a, b))."""
    rules = {}
    for a, b in zip(words, words[1:]):
        k = 0
        while k < len(a) and k < len(b) and a[k] == b[k]:
            k += 1
        if k < len(a) and k < len(b):
            rules.setdefault((a[k], b[k]), (a, b))
        elif len(a) > len(b):
            return None, (a, b)
    return rules, None


def _cycle(letters, rules):
    """A list of letters forming a cycle of rules, or None."""
    succ = {ch: [] for ch in letters}
    for x, y in rules:
        succ[x].append(y)
    color = dict.fromkeys(letters, 0)          # 0 new, 1 on the stack, 2 done
    for start in sorted(letters):
        if color[start]:
            continue
        color[start] = 1
        path, stack = [start], [iter(succ[start])]
        while stack:
            nxt = next(stack[-1], None)
            if nxt is None:
                color[path.pop()] = 2
                stack.pop()
            elif color[nxt] == 1:
                return path[path.index(nxt):] + [nxt]
            elif color[nxt] == 0:
                color[nxt] = 1
                path.append(nxt)
                stack.append(iter(succ[nxt]))
    return None


def _q(s):
    return '"' + s + '"'


def check(got, expected, args):
    words = args[0]
    letters = {ch for w in words for ch in w}
    rules, bad_pair = _rules(words)
    if bad_pair is not None:
        reason = (_q(bad_pair[0]) + " is listed before its own prefix " + _q(bad_pair[1])
                  + ", which no alphabet allows")
    else:
        loop = _cycle(letters, rules)
        reason = ("the rules form a cycle: " + " < ".join(loop)) if loop else None
    if reason is not None:
        if got == "":
            return True
        return "No alphabet fits this list — " + reason + " — so the answer is \"\"; you returned " + show(got, 80) + "."

    if not isinstance(got, str):
        return "Return the alphabet as a string, not " + show(got, 80) + "."
    if got == "":
        return "An alphabet does exist here (for example " + show(expected, 80) + "), but you returned \"\"."
    seen = set()
    for ch in got:
        if ch not in letters:
            return show(ch) + " doesn't appear in any word, so it can't be in the alphabet."
        if ch in seen:
            return show(ch) + " appears more than once in your alphabet."
        seen.add(ch)
    missing = sorted(letters - seen)
    if missing:
        return "Your alphabet is missing " + ", ".join(show(ch) for ch in missing) + "; every letter that appears in the words must be in it."
    rank = {ch: i for i, ch in enumerate(got)}
    for (x, y), (a, b) in rules.items():
        if rank[x] > rank[y]:
            return (_q(a) + " comes before " + _q(b) + " in the list, so " + show(x) + " must come before "
                    + show(y) + " — your alphabet " + show(got, 80) + " has it the other way round.")
    return True
