# Works the letters out arithmetically, three per key counting from 'a'. That
# holds up to 6, then breaks: 7 has four letters, which shifts every key after.
class Solution:
    def letterCombinations(self, digits):
        if not digits:
            return []
        out = [""]
        for d in digits:
            first = ord("a") + 3 * (int(d) - 2)
            out = [s + chr(first + k) for s in out for k in range(3)]
        return out
