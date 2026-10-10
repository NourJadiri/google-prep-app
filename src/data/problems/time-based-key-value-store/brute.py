class TimeMap:
    def __init__(self):
        self.log = []

    def set(self, key, value, timestamp):
        self.log.append((key, timestamp, value))

    def get(self, key, timestamp):
        best_t, best_v = 0, ""
        for k, t, v in self.log:
            if k == key and best_t < t <= timestamp:
                best_t, best_v = t, v
        return best_v
