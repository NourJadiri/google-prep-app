class Solution:
    def numDecodings(self, s):
        # Cut the string into pieces in every possible way, keeping only cuts
        # where each piece is one of the 26 codes, written exactly.
        codes = {str(k) for k in range(1, 27)}   # "1" .. "26": no leading zeros

        def count(i):                            # decodings of s[i:]
            if i == len(s):
                return 1
            total = 0
            for size in (1, 2):
                if i + size <= len(s) and s[i:i + size] in codes:
                    total += count(i + size)
            return total

        return count(0)
