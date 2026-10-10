# Deletes the removed value's entry, then re-points "the moved element" — but
# when the value removed is itself the last element, that second step puts it
# straight back into the dictionary, so the set still thinks it's there.
class RandomizedSet:
    def __init__(self):
        self.vals = []
        self.pos = {}

    def insert(self, val):
        if val in self.pos:
            return False
        self.pos[val] = len(self.vals)
        self.vals.append(val)
        return True

    def remove(self, val):
        if val not in self.pos:
            return False
        i = self.pos.pop(val)
        last = self.vals[-1]
        self.vals[i] = last
        self.pos[last] = i
        self.vals.pop()
        return True

    def getRandom(self):
        return random.choice(self.vals)
