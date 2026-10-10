# Starts the search at 0 instead of max(nums). For a cap below the largest
# number, the greedy still drops that number into a piece of its own, the
# count looks fine, and the search settles on a cap no cut can meet.
class Solution:
    def splitArray(self, nums, k):
        def pieces_needed(cap):
            count, cur = 1, 0
            for x in nums:
                if cur + x > cap:
                    count += 1
                    cur = 0
                cur += x
            return count

        lo, hi = 0, sum(nums)
        while lo < hi:
            cap = (lo + hi) // 2
            if pieces_needed(cap) <= k:
                hi = cap
            else:
                lo = cap + 1
        return lo
