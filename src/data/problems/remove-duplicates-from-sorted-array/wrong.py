# Builds the answer in a brand-new list and rebinds the name `nums` to it. The
# caller's list never changes, so its first k slots still hold the old values.
class Solution:
    def removeDuplicates(self, nums):
        nums = sorted(set(nums))
        return len(nums)
