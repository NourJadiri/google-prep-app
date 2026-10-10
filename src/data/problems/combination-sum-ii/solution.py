class Solution:
    def combinationSum2(self, candidates: List[int], target: int) -> List[List[int]]:
        candidates = sorted(candidates)
        out, path = [], []

        def backtrack(start, remaining):
            if remaining == 0:
                out.append(path[:])
                return
            for i in range(start, len(candidates)):
                c = candidates[i]
                if i > start and c == candidates[i - 1]:
                    continue        # this value already had its turn in this slot
                if c > remaining:
                    break           # sorted: every later candidate is too big as well
                path.append(c)                      # choose
                backtrack(i + 1, remaining - c)     # explore; entry i is used up
                path.pop()                          # un-choose

        backtrack(0, target)
        return out
