class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        candidates = sorted(candidates)
        out, path = [], []

        def backtrack(start, remaining):
            if remaining == 0:
                out.append(path[:])
                return
            # Only candidates[start:] may come next, so every combination is
            # built in non-decreasing order: once, never as a reordering.
            for i in range(start, len(candidates)):
                c = candidates[i]
                if c > remaining:
                    break                       # sorted: the rest are bigger still
                path.append(c)                  # choose
                backtrack(i, remaining - c)     # explore from i: c may be used again
                path.pop()                      # un-choose

        backtrack(0, target)
        return out
