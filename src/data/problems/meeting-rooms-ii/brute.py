class Solution:
    def minMeetingRooms(self, intervals):
        # The busiest moment is always some booking's start: count who is live then.
        best = 0
        for t, _ in intervals:
            live = sum(1 for s, e in intervals if s <= t < e)
            best = max(best, live)
        return best
