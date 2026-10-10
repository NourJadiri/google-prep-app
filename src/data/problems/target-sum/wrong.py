# Uses P = (total + target) // 2 without checking that total + target is even
# and that |target| <= total. Floor division quietly rounds an impossible
# target to a reachable one: [3,4] with target 2 counts the subset {4}.
class Solution:
    def findTargetSumWays(self, nums, target):
        goal = (sum(nums) + target) // 2
        ways = [1] + [0] * goal
        for x in nums:
            for s in range(goal, x - 1, -1):
                ways[s] += ways[s - x]
        return ways[goal] if goal >= 0 else 0
