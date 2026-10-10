class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        result = 0
        for x in nums:
            result ^= x     # x ^ x == 0 and x ^ 0 == x, so every pair cancels
        return result       # ...and only the single number is left
