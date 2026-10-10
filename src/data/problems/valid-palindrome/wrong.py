# Keeps letters but throws the digits away, so "1a2" is cleaned to "a".
class Solution:
    def isPalindrome(self, s):
        cleaned = [c.lower() for c in s if c.isalpha()]
        return cleaned == cleaned[::-1]
