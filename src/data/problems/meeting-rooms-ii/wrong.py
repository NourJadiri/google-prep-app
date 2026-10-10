# Treats back-to-back bookings as overlapping: a studio that frees up at 11
# can't be reused by a session starting at 11.
class Solution:
    def minMeetingRooms(self, intervals):
        ends = []
        for start, end in sorted(intervals):
            if ends and ends[0] < start:
                heapreplace(ends, end)
            else:
                heappush(ends, end)
        return len(ends)
