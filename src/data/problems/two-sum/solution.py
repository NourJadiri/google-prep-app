class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Value -> the index we first saw it at. Looking a complement up
        # *before* storing the current value is what stops a number from
        # pairing with itself.
        seen = {}
        for i, x in enumerate(nums):
            j = seen.get(target - x)
            if j is not None:
                return [j, i]
            seen[x] = i
        return []
