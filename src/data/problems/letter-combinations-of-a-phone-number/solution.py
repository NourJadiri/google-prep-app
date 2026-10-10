class Solution:
    KEYS = {
        "2": "abc", "3": "def", "4": "ghi", "5": "jkl",
        "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz",
    }

    def letterCombinations(self, digits: str) -> List[str]:
        if not digits:
            return []               # no digits, no combinations (not [""])
        out, path = [], []

        def backtrack(i):
            if i == len(digits):
                out.append("".join(path))
                return
            for ch in self.KEYS[digits[i]]:
                path.append(ch)     # choose a letter for digit i
                backtrack(i + 1)    # explore the remaining digits
                path.pop()          # un-choose

        backtrack(0)
        return out
