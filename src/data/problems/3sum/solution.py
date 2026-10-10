class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums = sorted(nums)
        n = len(nums)
        res = []
        for i in range(n - 2):
            if nums[i] > 0:
                break                   # the smallest of three is positive: no zero sum
            if i > 0 and nums[i] == nums[i - 1]:
                continue                # same anchor value, same triples: skip it
            lo, hi = i + 1, n - 1
            while lo < hi:
                s = nums[i] + nums[lo] + nums[hi]
                if s < 0:
                    lo += 1             # need bigger: nums[hi] is already the biggest left
                elif s > 0:
                    hi -= 1             # need smaller: nums[lo] is already the smallest left
                else:
                    res.append([nums[i], nums[lo], nums[hi]])
                    lo += 1
                    hi -= 1
                    while lo < hi and nums[lo] == nums[lo - 1]:
                        lo += 1         # step past copies of the middle value
        return res
