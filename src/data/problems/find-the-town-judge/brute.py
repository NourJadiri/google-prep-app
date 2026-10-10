class Solution:
    def findJudge(self, n, trust):
        # Check the definition directly for every resident.
        pairs = {(a, b) for a, b in trust}
        judges = []
        for j in range(1, n + 1):
            trusts_nobody = all((j, x) not in pairs for x in range(1, n + 1))
            everyone_trusts_j = all((x, j) in pairs for x in range(1, n + 1) if x != j)
            if trusts_nobody and everyone_trusts_j:
                judges.append(j)
        return judges[0] if len(judges) == 1 else -1
