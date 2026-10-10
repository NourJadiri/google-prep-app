# Records a subset only right after adding an element, so the empty subset
# never makes it into the answer.
class Solution:
    def subsets(self, nums):
        out, path = [], []

        def backtrack(start):
            for i in range(start, len(nums)):
                path.append(nums[i])
                out.append(path[:])
                backtrack(i + 1)
                path.pop()

        backtrack(0)
        return out
