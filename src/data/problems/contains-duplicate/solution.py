class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        # Everything we've walked past so far. A set answers "seen it?"
        # in O(1) on average, which is what makes one pass enough.
        seen = set()
        for x in nums:
            if x in seen:
                return True
            seen.add(x)
        return False
