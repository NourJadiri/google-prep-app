class Solution:
    def plusOne(self, digits: List[int]) -> List[int]:
        # Walk in from the last digit, as on paper: a 9 becomes 0 and passes
        # the carry left; any other digit absorbs it and we're done.
        for i in range(len(digits) - 1, -1, -1):
            if digits[i] < 9:
                digits[i] += 1
                return digits
            digits[i] = 0
        return [1] + digits    # every digit was 9: 99...9 + 1 = 100...0
