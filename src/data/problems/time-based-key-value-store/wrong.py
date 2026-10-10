# Searches with bisect_left: a get at exactly a set's timestamp lands one
# version too early (or on "" for the key's first version).
class TimeMap:
    def __init__(self):
        self.times = defaultdict(list)
        self.values = defaultdict(list)

    def set(self, key, value, timestamp):
        self.times[key].append(timestamp)
        self.values[key].append(value)

    def get(self, key, timestamp):
        i = bisect_left(self.times[key], timestamp)
        return self.values[key][i - 1] if i else ""
