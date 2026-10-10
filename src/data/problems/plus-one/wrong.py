# Carries correctly, but when every digit is 9 it runs out of digits and
# returns all zeros instead of growing a new leading 1.
class Solution:
    def plusOne(self, digits):
        for i in range(len(digits) - 1, -1, -1):
            if digits[i] < 9:
                digits[i] += 1
                return digits
            digits[i] = 0
        return digits
