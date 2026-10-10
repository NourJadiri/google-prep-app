# Accounts are nodes; two are adjacent when their email sets intersect
# (checked pair by pair). Each connected component is one person.
class Solution:
    def accountsMerge(self, accounts):
        n = len(accounts)
        sets = [set(a[1:]) for a in accounts]
        adj = [[j for j in range(n) if j != i and sets[i] & sets[j]] for i in range(n)]
        seen = [False] * n
        merged = []
        for s in range(n):
            if seen[s]:
                continue
            seen[s] = True
            stack, emails = [s], set()
            while stack:
                i = stack.pop()
                emails |= sets[i]
                for j in adj[i]:
                    if not seen[j]:
                        seen[j] = True
                        stack.append(j)
            merged.append([accounts[s][0]] + sorted(emails))
        return merged
