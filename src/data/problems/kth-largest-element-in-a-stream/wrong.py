# Never trims the heap in __init__. With more than k starting numbers the heap
# stays too big, so its top is the wrong rank, not the k-th largest.
class KthLargest:
    def __init__(self, k, nums):
        self.k = k
        self.heap = list(nums)
        heapq.heapify(self.heap)

    def add(self, val):
        heapq.heappush(self.heap, val)
        if len(self.heap) > self.k:
            heapq.heappop(self.heap)
        return self.heap[0]
