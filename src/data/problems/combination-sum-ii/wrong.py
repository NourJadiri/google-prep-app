# Skips a repeated value everywhere instead of only as a second choice for
# the same slot (i > 0 rather than i > start), so a combination can never
# hold the same value twice: [1,1,2] can't be built.
class Solution:
    def combinationSum2(self, candidates, target):
        candidates = sorted(candidates)
        out, path = [], []

        def backtrack(start, remaining):
            if remaining == 0:
                out.append(path[:])
                return
            for i in range(start, len(candidates)):
                c = candidates[i]
                if i > 0 and c == candidates[i - 1]:
                    continue
                if c > remaining:
                    break
                path.append(c)
                backtrack(i + 1, remaining - c)
                path.pop()

        backtrack(0, target)
        return out
