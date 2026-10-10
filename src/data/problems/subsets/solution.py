class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        out, path = [], []

        def backtrack(start):
            out.append(path[:])             # every node of the search tree is a subset
            for i in range(start, len(nums)):
                path.append(nums[i])        # choose nums[i]
                backtrack(i + 1)            # explore: only later elements may follow
                path.pop()                  # un-choose

        backtrack(0)
        return out
