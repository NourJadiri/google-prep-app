# Rolls 0 .. total-1 but searches as if the roll were 1 .. total: index 0 gets
# one extra outcome and the last index loses one. Invisible with big weights,
# glaring with w = [1, 1] (index 1 never comes up).
class Solution:
    def __init__(self, w):
        self.prefix = list(accumulate(w))

    def pickIndex(self):
        target = random.randint(0, self.prefix[-1] - 1)
        return bisect_left(self.prefix, target)
