# Sweeps the sums upward, so can[s - x] may already include x: a number gets
# reused. [2,2,3,5] "reaches" 6 as 3 + 3 and wrongly answers True.
class Solution:
    def canPartition(self, nums):
        total = sum(nums)
        if total % 2:
            return False
        target = total // 2
        can = [True] + [False] * target
        for x in nums:
            for s in range(x, target + 1):
                if can[s - x]:
                    can[s] = True
        return can[target]
