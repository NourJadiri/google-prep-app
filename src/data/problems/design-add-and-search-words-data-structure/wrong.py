# Returns from inside the loop over children: a dot only ever tries the first
# child, so ".ad" misses "cad" whenever "bat" was added before it.
class WordDictionary:
    def __init__(self):
        self.root = {}

    def addWord(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node["$"] = True

    def search(self, word):
        def dfs(node, i):
            if i == len(word):
                return "$" in node
            ch = word[i]
            if ch == ".":
                for key, child in node.items():
                    if key != "$":
                        return dfs(child, i + 1)
                return False
            return ch in node and dfs(node[ch], i + 1)

        return dfs(self.root, 0)
