class Solution:
    def isValid(self, s: str) -> bool:
        opener_for = {")": "(", "]": "[", "}": "{"}
        stack = []                  # openers still waiting for their closer, newest on top
        for ch in s:
            if ch in opener_for:
                # A closer must match the most recent opener that is still open.
                if not stack or stack.pop() != opener_for[ch]:
                    return False
            else:
                stack.append(ch)
        return not stack            # anything left over was never closed
