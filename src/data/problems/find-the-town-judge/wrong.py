# Only checks that everyone else trusts the candidate, and forgets that the
# judge must trust nobody.
class Solution:
    def findJudge(self, n, trust):
        trusted_by = [0] * (n + 1)
        for a, b in trust:
            trusted_by[b] += 1
        for person in range(1, n + 1):
            if trusted_by[person] == n - 1:
                return person
        return -1
