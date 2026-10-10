class Solution:
    def combinationSum(self, candidates, target):
        # ways[t] holds every multiset (as a sorted tuple) that sums to t,
        # built up from smaller totals; the set removes repeats.
        ways = [set() for _ in range(target + 1)]
        ways[0].add(())
        for t in range(1, target + 1):
            for c in candidates:
                if c <= t:
                    for combo in ways[t - c]:
                        ways[t].add(tuple(sorted(combo + (c,))))
        return [list(combo) for combo in ways[target]]
