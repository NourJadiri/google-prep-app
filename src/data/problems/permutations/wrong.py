# The in-place swap version without the swap back: each branch starts from
# the array the previous branch left scrambled, so some orders repeat and
# others never appear.
class Solution:
    def permute(self, nums):
        out = []

        def backtrack(k):
            if k == len(nums):
                out.append(nums[:])
                return
            for i in range(k, len(nums)):
                nums[k], nums[i] = nums[i], nums[k]
                backtrack(k + 1)

        backtrack(0)
        return out
