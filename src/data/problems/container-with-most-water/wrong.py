# Moves the taller wall inward instead of the shorter one, so it can throw
# away the wall that belongs to the best container.
class Solution:
    def maxArea(self, height):
        i, j = 0, len(height) - 1
        best = 0
        while i < j:
            best = max(best, min(height[i], height[j]) * (j - i))
            if height[i] > height[j]:
                i += 1
            else:
                j -= 1
        return best
