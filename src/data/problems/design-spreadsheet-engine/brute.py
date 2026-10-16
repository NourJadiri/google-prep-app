# Stores only what the user typed. get() evaluates from scratch every time,
# and a formula is rejected if following its references ever leads back home.

class Spreadsheet:
    def __init__(self):
        self.raw = {}

    def _refs(self, value):
        if isinstance(value, int):
            return []
        return [t for t in value[1:].split("+") if not t[0].isdigit()]

    def _reaches(self, start, target):
        if start == target:
            return True
        return any(self._reaches(r, target) for r in self._refs(self.raw.get(start, 0)))

    def set(self, cell, value):
        for r in self._refs(value):
            if self._reaches(r, cell):
                return False
        self.raw[cell] = value
        return True

    def get(self, cell):
        value = self.raw.get(cell, 0)
        if isinstance(value, int):
            return value
        total = 0
        for t in value[1:].split("+"):
            total += int(t) if t[0].isdigit() else self.get(t)
        return total
