class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        # tails[k] = the smallest value that can end a strictly increasing
        # subsequence of length k + 1 among the numbers seen so far.
        # tails itself is always strictly increasing, so it can be bisected.
        tails = []
        for x in nums:
            k = bisect_left(tails, x)   # first tail >= x (left: equal values don't extend)
            if k == len(tails):
                tails.append(x)         # x extends the longest subsequence so far
            else:
                tails[k] = x            # x is a smaller ending for length k + 1
        return len(tails)
