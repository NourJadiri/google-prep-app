# Prunes with `break` but never sorts the candidates: the first one that is
# too big ends the loop, and every smaller candidate listed after it is lost.
class Solution:
    def combinationSum(self, candidates, target):
        out, path = [], []

        def backtrack(start, remaining):
            if remaining == 0:
                out.append(path[:])
                return
            for i in range(start, len(candidates)):
                c = candidates[i]
                if c > remaining:
                    break
                path.append(c)
                backtrack(i, remaining - c)
                path.pop()

        backtrack(0, target)
        return out
