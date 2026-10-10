class Solution:
    def minEatingSpeed(self, piles, h):
        k = 1
        while True:
            hours = 0
            for p in piles:
                hours += p // k + (1 if p % k else 0)
            if hours <= h:
                return k
            k += 1
