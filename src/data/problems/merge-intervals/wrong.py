# Overwrites the block's end instead of taking the max: an interval sitting
# inside the block shrinks it, e.g. [1,10] then [2,3] leaves [1,3].
class Solution:
    def merge(self, intervals):
        merged = []
        for start, end in sorted(intervals, key=lambda iv: iv[0]):
            if merged and start <= merged[-1][1]:
                merged[-1][1] = end
            else:
                merged.append([start, end])
        return merged
