# Off by one: drops a request made exactly 3000 ms ago, but the window
# [t - 3000, t] includes it.
from collections import deque


class RecentCounter:

    def __init__(self):
        self.window = deque()

    def ping(self, t):
        self.window.append(t)
        while self.window[0] <= t - 3000:
            self.window.popleft()
        return len(self.window)
