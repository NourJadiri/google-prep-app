import random


class Solution:
    def __init__(self, w):
        self.w = list(w)
        self.total = sum(w)

    def pickIndex(self):
        r = random.randrange(self.total)  # 0 .. total - 1, each equally likely
        for i, x in enumerate(self.w):
            if r < x:
                return i
            r -= x
