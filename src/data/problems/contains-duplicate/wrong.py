# Only compares neighbours, as if the list were sorted: equal values that
# aren't side by side slip through.
class Solution:
    def containsDuplicate(self, nums):
        for i in range(len(nums) - 1):
            if nums[i] == nums[i + 1]:
                return True
        return False
