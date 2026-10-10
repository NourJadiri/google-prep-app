class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        # Invariant: nums[:write] holds each distinct value seen so far, once,
        # in order. The list is sorted, so a value is new exactly when it
        # differs from the last one we kept.
        write = 1
        for read in range(1, len(nums)):
            if nums[read] != nums[write - 1]:
                nums[write] = nums[read]
                write += 1
        return write   # a count of kept values, which is k
