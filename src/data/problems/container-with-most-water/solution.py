class Solution:
    def maxArea(self, height: List[int]) -> int:
        i, j = 0, len(height) - 1
        best = 0
        while i < j:
            # The shorter wall caps the water. Any other container using it
            # would be narrower and no taller, so it can be dropped for good.
            if height[i] < height[j]:
                best = max(best, height[i] * (j - i))
                i += 1
            else:
                best = max(best, height[j] * (j - i))
                j -= 1
        return best
