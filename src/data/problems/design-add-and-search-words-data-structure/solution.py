class TrieNode:
    def __init__(self):
        self.children = {}      # letter -> TrieNode
        self.is_word = False    # does an added word end exactly here?


class WordDictionary:

    def __init__(self):
        self.root = TrieNode()

    def addWord(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_word = True

    def search(self, word: str) -> bool:
        def match(node, i):
            # Can some path below `node` spell word[i:] and stop on a word?
            if i == len(word):
                return node.is_word
            ch = word[i]
            if ch != ".":
                child = node.children.get(ch)
                return child is not None and match(child, i + 1)
            # A dot is the only place we branch: try every child, and stop
            # at the first one that works.
            for child in node.children.values():
                if match(child, i + 1):
                    return True
            return False

        return match(self.root, 0)
