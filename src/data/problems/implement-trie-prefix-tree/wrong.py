# A self-filling defaultdict trie. search() steps with cur[ch], which quietly
# creates every missing node, so a failed search("dog") leaves d -> o -> g
# behind and a later startsWith("do") answers True.
from collections import defaultdict


def make_node():
    return defaultdict(make_node)


class Trie:
    def __init__(self):
        self.root = make_node()

    def insert(self, word):
        cur = self.root
        for ch in word:
            cur = cur[ch]
        cur["$"] = True

    def search(self, word):
        cur = self.root
        for ch in word:
            cur = cur[ch]
        return "$" in cur

    def startsWith(self, prefix):
        cur = self.root
        for ch in prefix:
            if ch not in cur:
                return False
            cur = cur[ch]
        return True
