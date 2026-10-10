class MedianFinder:

    def __init__(self):
        # low: the smaller half, as a max-heap (values stored negated).
        # high: the larger half, as a min-heap.
        # Invariants: everything in low <= everything in high, and
        # len(low) is either len(high) or len(high) + 1.
        self.low = []
        self.high = []

    def addNum(self, num: int) -> None:
        # Push through low so its largest value moves up into high: that keeps
        # the halves ordered whichever side num belongs on. Then make sure low
        # isn't the shorter one.
        heappush(self.low, -num)
        heappush(self.high, -heappop(self.low))
        if len(self.high) > len(self.low):
            heappush(self.low, -heappop(self.high))

    def findMedian(self) -> float:
        if len(self.low) > len(self.high):
            return float(-self.low[0])
        return (-self.low[0] + self.high[0]) / 2
