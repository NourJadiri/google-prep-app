class Solution:
    def backspaceCompare(self, s: str, t: str) -> bool:
        def next_kept(text, i):
            # Moving left from index i, the index of the next character that
            # survives the backspaces, or -1 if none is left. Reading backwards
            # means every '#' is seen before the characters it deletes.
            skip = 0
            while i >= 0:
                if text[i] == "#":
                    skip += 1
                elif skip:
                    skip -= 1
                else:
                    return i
                i -= 1
            return -1

        i, j = len(s) - 1, len(t) - 1
        while True:
            i, j = next_kept(s, i), next_kept(t, j)
            if i < 0 or j < 0:
                return i < 0 and j < 0      # equal only if both ran out together
            if s[i] != t[j]:
                return False
            i -= 1
            j -= 1
