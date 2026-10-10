class Solution:
    def mostCommonWord(self, paragraph, banned):
        letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
        words, current = [], ""
        for ch in paragraph + " ":
            if ch in letters:
                current += ch.lower()
            elif current:
                words.append(current)
                current = ""
        best, best_count = None, 0
        for w in words:
            if w not in banned and words.count(w) > best_count:
                best, best_count = w, words.count(w)
        return best
