# A sliding window: grow on the right, shrink from the left while the sum is
# too big. That is only valid when every number is positive — with negatives
# or zeros, the window skips subarrays that would have summed to k.
class Solution:
    def subarraySum(self, nums, k):
        count = left = s = 0
        for right, x in enumerate(nums):
            s += x
            while s > k and left <= right:
                s -= nums[left]
                left += 1
            if s == k:
                count += 1
        return count
