class Solution:
    def lengthOfLIS(self, nums):
        # Every element is either kept or skipped; keep it only if it's bigger
        # than the last kept value. Tries all 2^n choices in the worst case.
        def longest(i, last):
            if i == len(nums):
                return 0
            best = longest(i + 1, last)
            if nums[i] > last:
                best = max(best, 1 + longest(i + 1, nums[i]))
            return best

        return longest(0, float("-inf"))
