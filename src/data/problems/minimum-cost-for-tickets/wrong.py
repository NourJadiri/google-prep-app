# Off by one: a pass bought on day d is treated as still valid on day d + length.
class Solution:
    def mincostTickets(self, days, costs):
        n = len(days)
        best = [0] * (n + 1)               # best[i] = cheapest cover of days[i:]
        for i in range(n - 1, -1, -1):
            best[i] = float("inf")
            for length, price in zip((1, 7, 30), costs):
                j = i
                while j < n and days[j] <= days[i] + length:
                    j += 1
                best[i] = min(best[i], price + best[j])
        return best[0]
