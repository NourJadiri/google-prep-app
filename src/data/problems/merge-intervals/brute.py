class Solution:
    def merge(self, intervals):
        # Paint every interval onto a number line at double scale, so [1,2] and
        # [3,4] keep an unpainted cell (5) between them while [1,4] and [4,5]
        # share one (8). Each maximal painted run is one merged interval.
        top = 2 * max(end for _, end in intervals)
        painted = [False] * (top + 2)
        for start, end in intervals:
            for x in range(2 * start, 2 * end + 1):
                painted[x] = True
        out, x = [], 0
        while x <= top:
            if painted[x]:
                y = x
                while painted[y + 1]:
                    y += 1
                out.append([x // 2, y // 2])
                x = y + 1
            else:
                x += 1
        return out
