class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        # Invariant: nums[:write] holds the non-zero values met so far, in their
        # original order, and nums[write:read] holds only zeros.
        write = 0
        for read in range(len(nums)):
            if nums[read] != 0:
                nums[write], nums[read] = nums[read], nums[write]
                write += 1
