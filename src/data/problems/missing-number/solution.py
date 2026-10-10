class Solution:
    def missingNumber(self, nums: List[int]) -> int:
        n = len(nums)
        # 0 + 1 + ... + n is what a complete list would add up to; whatever
        # the real list falls short by is the number that isn't there.
        return n * (n + 1) // 2 - sum(nums)
