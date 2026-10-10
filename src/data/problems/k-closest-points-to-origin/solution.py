class Solution:
    def kClosest(self, points: List[List[int]], k: int) -> List[List[int]]:
        # A max-heap of the k closest points seen so far, keyed on squared
        # distance (no sqrt, no floats). heapq is a min-heap, so the distance
        # goes in negated: the root is then the FARTHEST of the k, the one a
        # closer newcomer evicts.
        heap = []
        for x, y in points:
            d = -(x * x + y * y)
            if len(heap) < k:
                heapq.heappush(heap, (d, x, y))
            elif d > heap[0][0]:              # closer than the farthest kept
                heapq.heapreplace(heap, (d, x, y))
        return [[x, y] for _, x, y in heap]
