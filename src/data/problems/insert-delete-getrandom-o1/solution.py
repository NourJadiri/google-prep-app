class RandomizedSet:

    def __init__(self):
        self.vals = []    # the members, in no particular order: getRandom rolls an index here
        self.pos = {}     # member -> its index in self.vals

    def insert(self, val: int) -> bool:
        if val in self.pos:
            return False
        self.pos[val] = len(self.vals)
        self.vals.append(val)
        return True

    def remove(self, val: int) -> bool:
        i = self.pos.pop(val, None)
        if i is None:
            return False
        last = self.vals.pop()
        # If val wasn't the last element, the popped one fills its hole —
        # and its recorded index has to follow it there.
        if i < len(self.vals):
            self.vals[i] = last
            self.pos[last] = i
        return True

    def getRandom(self) -> int:
        return random.choice(self.vals)
