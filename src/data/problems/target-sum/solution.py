class Solution:
    def findTargetSumWays(self, nums: List[int], target: int) -> int:
        total = sum(nums)
        # Split the numbers into a plus group P and a minus group N:
        #   P - N = target  and  P + N = total   =>   P = (total + target) / 2.
        # P must be a whole number between 0 and total, or nothing works.
        if abs(target) > total or (total + target) % 2:
            return 0
        goal = (total + target) // 2
        # ways[s] = number of subsets (picked by position) of the numbers seen
        # so far that add up to s.
        ways = [1] + [0] * goal
        for x in nums:
            # Downward, so each number joins a subset at most once. With x = 0
            # this doubles every entry: +0 and -0 are two different patterns.
            for s in range(goal, x - 1, -1):
                ways[s] += ways[s - x]
        return ways[goal]
