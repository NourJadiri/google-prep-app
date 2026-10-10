class Solution:
    def rob(self, nums):
        n = len(nums)
        best = 0

        # Walk the houses in order, robbing or skipping each one, and refuse
        # any choice that puts two neighbours (including n-1 and 0) together.
        def choose(i, total, robbed_prev, robbed_first):
            nonlocal best
            if i == n:
                best = max(best, total)
                return
            choose(i + 1, total, False, robbed_first)
            if robbed_prev:
                return
            if n > 1 and i == n - 1 and robbed_first:
                return
            choose(i + 1, total + nums[i], True, robbed_first or i == 0)

        choose(0, 0, False, False)
        return best
