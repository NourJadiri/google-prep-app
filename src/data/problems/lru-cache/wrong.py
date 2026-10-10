# Reading a key doesn't count as using it: get() never moves the entry to
# the most-recent end, so a key that is read constantly is still evicted as
# if it had been forgotten.
from collections import OrderedDict


class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key):
        return self.cache.get(key, -1)

    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)
