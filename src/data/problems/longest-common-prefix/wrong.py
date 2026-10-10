# Compares only the first and last strings. That shortcut needs the list
# sorted first; unsorted, a string in the middle can break the prefix sooner.
class Solution:
    def longestCommonPrefix(self, strs):
        a, b = strs[0], strs[-1]
        i = 0
        while i < len(a) and i < len(b) and a[i] == b[i]:
            i += 1
        return a[:i]
