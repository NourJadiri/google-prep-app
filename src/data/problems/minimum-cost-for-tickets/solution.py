class Solution:
    def mincostTickets(self, days: List[int], costs: List[int]) -> int:
        # best[d] = cheapest way to cover every trip on or before calendar day d.
        trips = set(days)
        last = days[-1]
        best = [0] * (last + 1)
        for d in range(1, last + 1):
            if d not in trips:
                best[d] = best[d - 1]      # nothing new to cover today
                continue
            # Some pass covers today's trip. For trips up to day d it's never
            # worse to slide that pass so it ENDS today: a 7-day pass then
            # covers d-6..d, and everything before that is best[d - 7].
            best[d] = min(best[d - 1] + costs[0],
                          best[max(0, d - 7)] + costs[1],
                          best[max(0, d - 30)] + costs[2])
        return best[last]
