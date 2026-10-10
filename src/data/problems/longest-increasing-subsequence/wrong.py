# bisect.bisect is bisect_right under another name: an x equal to a tail lands
# *after* it and extends the list, so equal values count as increasing.
# [5,5,5] gives 3, not 1.
class Solution:
    def lengthOfLIS(self, nums):
        tails = []
        for x in nums:
            k = bisect.bisect(tails, x)
            if k == len(tails):
                tails.append(x)
            else:
                tails[k] = x
        return len(tails)
