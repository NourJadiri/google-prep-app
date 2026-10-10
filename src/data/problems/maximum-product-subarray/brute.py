class Solution:
    def maxProduct(self, nums):
        best = nums[0]
        # Every subarray nums[i..j], its product built up one element at a time.
        for i in range(len(nums)):
            product = 1
            for j in range(i, len(nums)):
                product *= nums[j]
                best = max(best, product)
        return best
