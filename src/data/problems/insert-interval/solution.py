class Solution:
    def insert(self, intervals: List[List[int]], newInterval: List[int]) -> List[List[int]]:
        start, end = newInterval
        out = []
        i, n = 0, len(intervals)
        # 1. Intervals that end before the new one starts: copied as they are.
        while i < n and intervals[i][1] < start:
            out.append(intervals[i])
            i += 1
        # 2. Intervals that start before the new one ends (sharing an endpoint
        #    counts) overlap it: fold each one in, growing the new interval.
        while i < n and intervals[i][0] <= end:
            start = min(start, intervals[i][0])
            end = max(end, intervals[i][1])
            i += 1
        out.append([start, end])
        # 3. Everything that starts after it: copied as it is.
        out.extend(intervals[i:])
        return out
