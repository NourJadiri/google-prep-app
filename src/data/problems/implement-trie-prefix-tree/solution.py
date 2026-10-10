class TrieNode:
    def __init__(self):
        self.children = {}      # letter -> TrieNode
        self.is_word = False    # does an inserted word end exactly here?


class Trie:

    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_word = True

    def search(self, word: str) -> bool:
        node = self._find(word)
        return node is not None and node.is_word

    def startsWith(self, prefix: str) -> bool:
        return self._find(prefix) is not None

    def _find(self, s: str) -> Optional[TrieNode]:
        # Read-only on purpose: a lookup that falls off the trie must not
        # leave nodes behind, or later startsWith calls would see them.
        node = self.root
        for ch in s:
            node = node.children.get(ch)
            if node is None:
                return None
        return node
