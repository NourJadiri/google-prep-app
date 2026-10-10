class Solution:
    def findMaxAverage(self, nums: List[int], k: int) -> float:
        window = sum(nums[:k])                 # the first window
        best = window                          # not 0: every sum might be negative
        for i in range(k, len(nums)):
            window += nums[i] - nums[i - k]    # nums[i] slides in, nums[i - k] slides out
            best = max(best, window)
        return best / k                        # divide once, at the end
