class Solution:
    def reorganizeString(self, s):
        # Deal the letters, most frequent first, into positions 0, 2, 4, ...
        # and then 1, 3, 5, ... Copies of a letter land two apart; dealing
        # the most frequent letter first is what stops a letter that wraps
        # from the even slots to the odd ones from landing next to itself.
        n = len(s)
        counts = {}
        for ch in s:
            counts[ch] = counts.get(ch, 0) + 1
        order = sorted(counts, key=lambda ch: -counts[ch])
        if counts[order[0]] > (n + 1) // 2:
            return ""
        slots = [""] * n
        i = 0
        for ch in order:
            for _ in range(counts[ch]):
                slots[i] = ch
                i += 2
                if i >= n:
                    i = 1
        return "".join(slots)
