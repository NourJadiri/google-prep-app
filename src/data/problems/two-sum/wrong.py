# Stores before looking, so a value can pair with itself.
class Solution:
    def twoSum(self, nums, target):
        seen = {x: i for i, x in enumerate(nums)}
        for i, x in enumerate(nums):
            if target - x in seen:
                return [i, seen[target - x]]
        return []
