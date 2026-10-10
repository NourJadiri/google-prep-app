class KthLargest:

    def __init__(self, k: int, nums: List[int]):
        # A min-heap holding the k largest values seen so far. Its top, the
        # smallest of those k, is the k-th largest overall.
        self.k = k
        self.heap = list(nums)
        heapq.heapify(self.heap)
        while len(self.heap) > k:
            heapq.heappop(self.heap)    # k larger values exist: it can never matter again

    def add(self, val: int) -> int:
        # Push first, then trim. When the heap started one short (k equal to
        # len(nums) + 1), this fills it instead of popping.
        heapq.heappush(self.heap, val)
        if len(self.heap) > self.k:
            heapq.heappop(self.heap)
        return self.heap[0]
