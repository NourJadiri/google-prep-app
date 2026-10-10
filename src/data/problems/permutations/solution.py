class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        out, path = [], []
        used = [False] * len(nums)

        def backtrack():
            if len(path) == len(nums):
                out.append(path[:])
                return
            for i, x in enumerate(nums):
                if used[i]:
                    continue                # already placed in an earlier slot
                used[i] = True              # choose x for the next slot
                path.append(x)
                backtrack()                 # explore
                path.pop()                  # un-choose: undo both changes,
                used[i] = False             # so x is free for the next branch

        backtrack()
        return out
