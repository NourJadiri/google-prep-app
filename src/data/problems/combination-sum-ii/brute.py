class Solution:
    def combinationSum2(self, candidates, target):
        # Every subset of positions; equal multisets collapse in a set.
        n = len(candidates)
        found = set()
        for mask in range(1, 1 << n):
            pick = [candidates[i] for i in range(n) if mask >> i & 1]
            if sum(pick) == target:
                found.add(tuple(sorted(pick)))
        return [list(t) for t in found]
