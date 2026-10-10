class Solution:
    def containsNearbyDuplicate(self, nums, k):
        for i in range(len(nums)):
            for j in range(i + 1, len(nums)):
                if nums[i] == nums[j] and j - i <= k:
                    return True
        return False
