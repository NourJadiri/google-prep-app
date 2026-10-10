from itertools import product


class Solution:
    def letterCombinations(self, digits):
        pad = ["", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"]
        if digits == "":
            return []
        return ["".join(letters) for letters in product(*(pad[int(d)] for d in digits))]
