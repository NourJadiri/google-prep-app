class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        merged = []
        for start, end in sorted(intervals, key=lambda iv: iv[0]):
            # Sorted by start, an interval can only overlap the LAST merged
            # block: every earlier block ended before that one began.
            if merged and start <= merged[-1][1]:
                merged[-1][1] = max(merged[-1][1], end)   # it may sit entirely inside
            else:
                merged.append([start, end])
        return merged
