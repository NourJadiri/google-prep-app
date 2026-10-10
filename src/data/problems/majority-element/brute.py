class Solution:
    def majorityElement(self, nums):
        for x in nums:
            if 2 * nums.count(x) > len(nums):
                return x
