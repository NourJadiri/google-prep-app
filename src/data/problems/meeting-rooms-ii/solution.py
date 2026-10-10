class Solution:
    def minMeetingRooms(self, intervals: List[List[int]]) -> int:
        ends = []          # min-heap: the end time of the session in each studio opened so far
        for start, end in sorted(intervals):
            if ends and ends[0] <= start:
                heapreplace(ends, end)     # the earliest-free studio is free by now: reuse it
            else:
                heappush(ends, end)        # every studio is busy: open another
        # The heap never shrinks, so its final size is the most studios ever needed at once.
        return len(ends)
