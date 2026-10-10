# Stops at the first single-digit number and calls only 1 happy. It always
# finishes (every chain reaches a single digit), but 7 is happy too:
# 7 -> 49 -> 97 -> 130 -> 10 -> 1.
class Solution:
    def isHappy(self, n):
        while n >= 10:
            n = sum(int(d) ** 2 for d in str(n))
        return n == 1
