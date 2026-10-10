class Solution:
    def trap(self, height):
        # Straight from the definition: the water over bar i rises to the
        # lower of the tallest bar on its left and the tallest on its right
        # (each including bar i itself).
        total = 0
        for i in range(len(height)):
            level = min(max(height[:i + 1]), max(height[i:]))
            total += level - height[i]
        return total
