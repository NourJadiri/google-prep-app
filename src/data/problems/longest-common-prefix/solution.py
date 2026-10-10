class Solution:
    def longestCommonPrefix(self, strs: List[str]) -> str:
        first = strs[0]
        for i, ch in enumerate(first):          # column i, read top to bottom
            for s in strs[1:]:
                if i == len(s) or s[i] != ch:   # s ran out, or disagrees here
                    return first[:i]
        return first                            # every column of `first` matched
