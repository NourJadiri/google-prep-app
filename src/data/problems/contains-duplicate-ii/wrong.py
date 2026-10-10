# Remembers only where each value FIRST appeared. Two later copies can be close
# together while both are far from the first one, and that pair is missed.
class Solution:
    def containsNearbyDuplicate(self, nums, k):
        first = {}
        for i, x in enumerate(nums):
            if x in first:
                if i - first[x] <= k:
                    return True
            else:
                first[x] = i
        return False
