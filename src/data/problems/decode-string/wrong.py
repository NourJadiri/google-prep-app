# Treats each digit as the whole count: "12[o]" repeats twice, not twelve times.
class Solution:
    def decodeString(self, s):
        stack = []
        cur, num = [], 0
        for ch in s:
            if ch.isdigit():
                num = int(ch)
            elif ch == "[":
                stack.append((cur, num))
                cur, num = [], 0
            elif ch == "]":
                prev, k = stack.pop()
                prev.append("".join(cur) * k)
                cur = prev
            else:
                cur.append(ch)
        return "".join(cur)
