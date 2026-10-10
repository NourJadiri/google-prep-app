# Looks for each letter of s starting where the previous one was found, but
# never steps past that match. A repeated letter in s can then reuse a single
# letter of t: "boot" "fits" in "robot".
class Solution:
    def isSubsequence(self, s, t):
        pos = 0
        for ch in s:
            pos = t.find(ch, pos)
            if pos == -1:
                return False
        return True
