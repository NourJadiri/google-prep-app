class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:
        words = set(wordList)
        if endWord not in words:
            return 0
        L = len(beginWord)
        # Bucket the dictionary by pattern: "c*ld" holds every word that
        # matches "cold" except in position 1, so a word's neighbours are
        # just the contents of its L buckets.
        buckets = defaultdict(list)
        for w in words:
            for i in range(L):
                buckets[w[:i] + "*" + w[i + 1:]].append(w)

        seen = {beginWord}
        queue = deque([beginWord])
        length = 1                                # words in the ladder so far
        while queue:
            for _ in range(len(queue)):           # one BFS layer = one more rung
                w = queue.popleft()
                if w == endWord:
                    return length
                for i in range(L):
                    # A bucket's words are all queued the first time it's opened,
                    # so it never needs opening again: pop it.
                    for nxt in buckets.pop(w[:i] + "*" + w[i + 1:], ()):
                        if nxt not in seen:
                            seen.add(nxt)
                            queue.append(nxt)
            length += 1
        return 0
