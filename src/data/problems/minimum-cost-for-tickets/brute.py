class Solution:
    def mincostTickets(self, days, costs):
        # Look at the earliest trip not yet covered. Some pass must cover it,
        # and starting that pass on the trip itself covers the most later
        # trips, so try each of the three passes bought that day.
        n = len(days)
        memo = {}

        def cover(i):                      # cheapest way to cover days[i:]
            if i == n:
                return 0
            if i not in memo:
                options = []
                for length, price in zip((1, 7, 30), costs):
                    j = i
                    while j < n and days[j] < days[i] + length:
                        j += 1
                    options.append(price + cover(j))
                memo[i] = min(options)
            return memo[i]

        return cover(0)
