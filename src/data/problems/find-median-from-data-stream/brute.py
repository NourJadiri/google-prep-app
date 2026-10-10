class MedianFinder:
    def __init__(self):
        self.nums = []

    def addNum(self, num):
        self.nums.append(num)

    def findMedian(self):
        s = sorted(self.nums)
        m = len(s) // 2
        if len(s) % 2 == 1:
            return float(s[m])
        return (s[m - 1] + s[m]) / 2
