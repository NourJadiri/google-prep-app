class Solution:
    def backspaceCompare(self, s, t):
        def typed(keys):
            text = []
            for ch in keys:
                if ch == "#":
                    if text:
                        text.pop()
                else:
                    text.append(ch)
            return "".join(text)

        return typed(s) == typed(t)
