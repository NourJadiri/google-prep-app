# Forgets that heapq is a min-heap: popping whenever the heap grows past k
# throws away the CLOSEST point each time, so the k farthest survive.
class Solution:
    def kClosest(self, points, k):
        heap = []
        for x, y in points:
            heapq.heappush(heap, (x * x + y * y, x, y))
            if len(heap) > k:
                heapq.heappop(heap)
        return [[x, y] for _, x, y in heap]
