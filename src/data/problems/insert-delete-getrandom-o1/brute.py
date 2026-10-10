import random


class RandomizedSet:
    def __init__(self):
        self.items = []

    def insert(self, val):
        if val in self.items:
            return False
        self.items.append(val)
        return True

    def remove(self, val):
        if val not in self.items:
            return False
        self.items.remove(val)
        return True

    def getRandom(self):
        return self.items[random.randrange(len(self.items))]
