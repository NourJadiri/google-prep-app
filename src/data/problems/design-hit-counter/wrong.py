# Off by one: treats the window as [t - 300, t], one second too wide.
from collections import deque

class HitCounter:
    def __init__(self):
        self.q = deque()

    def record(self, t):
        self.q.append(t)

    def count(self, t):
        while self.q and self.q[0] < t - 300:
            self.q.popleft()
        return len(self.q)
