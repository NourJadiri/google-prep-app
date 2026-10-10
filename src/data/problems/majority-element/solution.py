class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        # Boyer-Moore voting. `count` is how many copies of `candidate` are
        # still unpaired; every different value cancels one of them.
        candidate, count = None, 0
        for x in nums:
            if count == 0:          # everything so far has cancelled out
                candidate = x
            count += 1 if x == candidate else -1
        # The majority has more copies than all other values put together,
        # so it can't be cancelled away: it's the candidate left standing.
        return candidate
