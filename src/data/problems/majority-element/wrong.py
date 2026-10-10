# Seeds the candidate with nums[0] and then loops over every number, so the
# first number is counted twice. On [1,2,2] it answers 1.
class Solution:
    def majorityElement(self, nums):
        candidate, count = nums[0], 1
        for x in nums:
            if count == 0:
                candidate = x
            count += 1 if x == candidate else -1
        return candidate
