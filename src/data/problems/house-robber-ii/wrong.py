# Breaks the circle correctly but forgets the single house: with n = 1 both
# straight streets are empty and it returns 0 instead of nums[0].
class Solution:
    def rob(self, nums):
        def rob_line(houses):
            take = skip = 0
            for cash in houses:
                take, skip = skip + cash, max(take, skip)
            return max(take, skip)

        return max(rob_line(nums[:-1]), rob_line(nums[1:]))
