# The classic miss: when a cell gets a new formula, it never leaves its old
# references' reader sets. Values still come out right (a stale reader just
# recomputes from its current formula), but the stale edges fake cycles:
# B1 = "=A1", then B1 = 5, then A1 = "=B1" gets rejected for a loop that's gone.
import collections


class Spreadsheet:
    def __init__(self):
        self.value = {}
        self.terms = {}
        self.readers = collections.defaultdict(set)

    def set(self, cell, value):
        if isinstance(value, int):
            refs, const = [], value
        else:
            refs, const = [], 0
            for t in value[1:].split("+"):
                if t[0].isdigit():
                    const += int(t)
                else:
                    refs.append(t)

        affected, stack = {cell}, [cell]
        while stack:
            for u in self.readers[stack.pop()]:
                if u not in affected:
                    affected.add(u)
                    stack.append(u)
        if any(r in affected for r in refs):
            return False

        for r in refs:                          # hooked in, never unhooked
            self.readers[r].add(cell)
        self.terms[cell] = (refs, const)

        waiting = {c: 0 for c in affected}
        for c in affected:
            for u in self.readers[c]:
                if u in waiting:
                    waiting[u] += 1
        ready = collections.deque([cell])
        while ready:
            c = ready.popleft()
            refs_c, const_c = self.terms[c]
            self.value[c] = const_c + sum(self.value.get(r, 0) for r in refs_c)
            for u in self.readers[c]:
                waiting[u] -= 1
                if waiting[u] == 0:
                    ready.append(u)
        return True

    def get(self, cell):
        return self.value.get(cell, 0)
