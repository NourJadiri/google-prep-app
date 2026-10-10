class Solution:
    def containsNearbyDuplicate(self, nums: List[int], k: int) -> bool:
        last = {}                              # value -> the latest index it appeared at
        for i, x in enumerate(nums):
            if x in last and i - last[x] <= k:
                return True
            # The newest copy is the closest one for anything still to come.
            last[x] = i
        return False
