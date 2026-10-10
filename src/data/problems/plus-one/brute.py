class Solution:
    def plusOne(self, digits):
        number = int("".join(str(d) for d in digits)) + 1
        return [int(c) for c in str(number)]
