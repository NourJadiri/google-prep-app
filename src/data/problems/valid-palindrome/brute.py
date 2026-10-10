import string


class Solution:
    def isPalindrome(self, s):
        keep = string.ascii_letters + string.digits
        cleaned = [c.lower() for c in s if c in keep]
        return cleaned == cleaned[::-1]
