# Returns the moment it builds endWord, before checking that endWord is in the
# dictionary at all.
class Solution:
    def ladderLength(self, beginWord, endWord, wordList):
        words = set(wordList)
        queue = deque([(beginWord, 1)])
        seen = {beginWord}
        while queue:
            w, steps = queue.popleft()
            for i in range(len(w)):
                for ch in "abcdefghijklmnopqrstuvwxyz":
                    nxt = w[:i] + ch + w[i + 1:]
                    if nxt == endWord:
                        return steps + 1
                    if nxt in words and nxt not in seen:
                        seen.add(nxt)
                        queue.append((nxt, steps + 1))
        return 0
