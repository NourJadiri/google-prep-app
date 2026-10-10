class WordDictionary:
    def __init__(self):
        self.words = []

    def addWord(self, word):
        self.words.append(word)

    def search(self, word):
        for w in self.words:
            if len(w) != len(word):
                continue
            ok = True
            for p, c in zip(word, w):
                if p != "." and p != c:
                    ok = False
                    break
            if ok:
                return True
        return False
