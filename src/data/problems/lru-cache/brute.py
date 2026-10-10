class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.items = []          # [key, value] pairs, least recently used first

    def _find(self, key):
        for i, (k, _) in enumerate(self.items):
            if k == key:
                return i
        return -1

    def get(self, key):
        i = self._find(key)
        if i < 0:
            return -1
        item = self.items.pop(i)
        self.items.append(item)
        return item[1]

    def put(self, key, value):
        i = self._find(key)
        if i >= 0:
            self.items.pop(i)
        elif len(self.items) == self.capacity:
            self.items.pop(0)
        self.items.append([key, value])
