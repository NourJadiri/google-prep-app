# Uses the tallest bar strictly left and strictly right of each bar, and
# forgets that a bar taller than both holds no water — not negative water.
class Solution:
    def trap(self, height):
        n = len(height)
        left = [0] * n
        right = [0] * n
        for i in range(1, n):
            left[i] = max(left[i - 1], height[i - 1])
        for i in range(n - 2, -1, -1):
            right[i] = max(right[i + 1], height[i + 1])
        return sum(min(left[i], right[i]) - height[i] for i in range(n))
