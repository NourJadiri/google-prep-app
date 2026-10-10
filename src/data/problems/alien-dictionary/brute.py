class Solution:
    def alienOrder(self, words):
        letters = sorted({ch for w in words for ch in w})
        before = set()
        # Every pair of words, not just neighbours: each one must be in order.
        for i in range(len(words)):
            for j in range(i + 1, len(words)):
                a, b = words[i], words[j]
                k = 0
                while k < min(len(a), len(b)) and a[k] == b[k]:
                    k += 1
                if k == min(len(a), len(b)):
                    if len(a) > len(b):
                        return ""
                else:
                    before.add((a[k], b[k]))
        # Pick, again and again, the smallest letter with no unplaced predecessor.
        placed, out = set(), []
        while len(out) < len(letters):
            for ch in letters:
                if ch not in placed and all(x in placed for x, y in before if y == ch):
                    placed.add(ch)
                    out.append(ch)
                    break
            else:
                return ""            # every remaining letter waits on another: a cycle
        return "".join(out)
