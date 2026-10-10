from collections import deque


class RecentCounter:

    def __init__(self):
        self.window = deque()   # times of the requests still in the window, oldest first

    def ping(self, t: int) -> int:
        self.window.append(t)
        # Times only grow, so a request that is too old now stays too old for
        # every later ping: drop it from the front for good.
        while self.window[0] < t - 3000:
            self.window.popleft()
        return len(self.window)
