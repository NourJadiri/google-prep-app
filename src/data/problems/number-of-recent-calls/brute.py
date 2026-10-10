class RecentCounter:

    def __init__(self):
        self.times = []

    def ping(self, t):
        self.times.append(t)
        return sum(1 for p in self.times if t - 3000 <= p <= t)
