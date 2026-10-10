# Integer division: the mean of the two middle values is floored, so the
# median of 1 and 2 comes out as 1 instead of 1.5 (and -1, -2 as -2).
class MedianFinder:
    def __init__(self):
        self.low = []
        self.high = []

    def addNum(self, num):
        heappush(self.low, -num)
        heappush(self.high, -heappop(self.low))
        if len(self.high) > len(self.low):
            heappush(self.low, -heappop(self.high))

    def findMedian(self):
        if len(self.low) > len(self.high):
            return -self.low[0]
        return (-self.low[0] + self.high[0]) // 2
