# Same length and the same set of letters -- but it never compares how many
# times each letter appears, so "aab" and "abb" look like anagrams.
class Solution:
    def isAnagram(self, s, t):
        return len(s) == len(t) and set(s) == set(t)
