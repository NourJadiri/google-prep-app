import re


class Solution:
    def decodeString(self, s):
        # Expand every innermost group (a count, then brackets holding letters
        # only) until no brackets remain.
        innermost = re.compile(r"(\d+)\[([a-z]*)\]")
        while "[" in s:
            s = innermost.sub(lambda m: int(m.group(1)) * m.group(2), s)
        return s
