class Solution:
    def rob(self, nums: List[int]) -> int:
        def rob_line(houses):
            # take: best total if the previous house was robbed;
            # skip: best total if it wasn't.
            take = skip = 0
            for cash in houses:
                take, skip = skip + cash, max(take, skip)
            return max(take, skip)

        if len(nums) == 1:
            return nums[0]
        # Houses 0 and n-1 are neighbours, so every valid plan leaves at least
        # one of them alone: solve the two straight streets and keep the better.
        return max(rob_line(nums[:-1]), rob_line(nums[1:]))
