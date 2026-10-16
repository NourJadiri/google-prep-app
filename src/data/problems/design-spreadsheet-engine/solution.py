class Spreadsheet:

    def __init__(self):
        self.value = {}                         # cell -> cached number (unset cells read 0)
        self.terms = {}                         # cell -> (refs, constant) it was last set to
        self.reads = collections.defaultdict(set)    # cell -> cells its formula reads
        self.readers = collections.defaultdict(set)  # cell -> cells whose formula reads it

    def set(self, cell: str, value: int | str) -> bool:
        refs, const = self._parse(value)

        # Everything that must be recomputed: the cell, then whoever reads it,
        # transitively. If the new formula reads any of these, it reads itself.
        affected = self._downstream(cell)
        if any(r in affected for r in refs):
            return False                        # cycle: leave the sheet untouched

        # Unhook the old formula's edges before hooking the new ones,
        # or a dropped reference keeps pushing updates into this cell.
        for r in self.reads.pop(cell, ()):
            self.readers[r].discard(cell)
        for r in refs:
            self.reads[cell].add(r)
            self.readers[r].add(cell)
        self.terms[cell] = (refs, const)

        # Recompute in topological order (Kahn's) over the affected cells only.
        # A cell waits until every affected cell it reads is already up to date.
        waiting = {c: 0 for c in affected}
        for c in affected:
            for user in self.readers[c]:
                waiting[user] += 1
        ready = collections.deque([cell])       # the only affected cell with nothing to wait for
        while ready:
            c = ready.popleft()
            refs_c, const_c = self.terms[c]
            self.value[c] = const_c + sum(self.value.get(r, 0) for r in refs_c)
            for user in self.readers[c]:
                waiting[user] -= 1
                if waiting[user] == 0:
                    ready.append(user)
        return True

    def get(self, cell: str) -> int:
        return self.value.get(cell, 0)          # O(1): the work already happened in set

    def _downstream(self, cell):
        seen, stack = {cell}, [cell]
        while stack:
            for user in self.readers[stack.pop()]:
                if user not in seen:
                    seen.add(user)
                    stack.append(user)
        return seen

    @staticmethod
    def _parse(value):
        if isinstance(value, int):
            return [], value
        refs, const = [], 0
        for term in value[1:].split("+"):       # drop the leading "="
            if term[0].isdigit():
                const += int(term)
            else:
                refs.append(term)               # repeats stay: "=A1+A1" counts A1 twice
        return refs, const
