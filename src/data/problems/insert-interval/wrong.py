# Uses <= in the first loop: an interval that ENDS exactly where the new one
# starts is copied as if it lay entirely before it, instead of being merged.
class Solution:
    def insert(self, intervals, newInterval):
        start, end = newInterval
        out = []
        i, n = 0, len(intervals)
        while i < n and intervals[i][1] <= start:
            out.append(intervals[i])
            i += 1
        while i < n and intervals[i][0] <= end:
            start = min(start, intervals[i][0])
            end = max(end, intervals[i][1])
            i += 1
        out.append([start, end])
        out.extend(intervals[i:])
        return out
