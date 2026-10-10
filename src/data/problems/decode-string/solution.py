class Solution:
    def decodeString(self, s: str) -> str:
        stack = []           # one frame per open bracket: (text before it, its count)
        cur, num = [], 0     # pieces of the text at this depth; the count being read
        for ch in s:
            if ch.isdigit():
                num = num * 10 + int(ch)        # counts can run to several digits
            elif ch == "[":
                stack.append((cur, num))        # set this depth aside...
                cur, num = [], 0                # ...and start the inner text fresh
            elif ch == "]":
                prev, k = stack.pop()
                prev.append("".join(cur) * k)   # inner text, k times, after what came before
                cur = prev
            else:
                cur.append(ch)
        return "".join(cur)
