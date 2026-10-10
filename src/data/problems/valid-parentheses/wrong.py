# Never checks for leftovers at the end, so openers that are never closed slip through.
class Solution:
    def isValid(self, s):
        opener_for = {")": "(", "]": "[", "}": "{"}
        stack = []
        for ch in s:
            if ch in opener_for:
                if not stack or stack.pop() != opener_for[ch]:
                    return False
            else:
                stack.append(ch)
        return True
