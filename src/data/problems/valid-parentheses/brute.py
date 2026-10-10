class Solution:
    def isValid(self, s):
        # A balanced string always has an adjacent matched pair somewhere.
        # Delete pairs until none are left: balanced strings vanish entirely.
        while True:
            shorter = s.replace("()", "").replace("[]", "").replace("{}", "")
            if shorter == s:
                return s == ""
            s = shorter
