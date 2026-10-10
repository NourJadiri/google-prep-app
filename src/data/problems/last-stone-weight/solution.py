class Solution:
    def lastStoneWeight(self, stones: List[int]) -> int:
        # heapq is a min-heap, so store every weight negated: the heaviest
        # stone becomes the smallest number and comes out first.
        heap = [-w for w in stones]
        heapq.heapify(heap)
        while len(heap) > 1:
            y = -heapq.heappop(heap)    # the heaviest stone
            x = -heapq.heappop(heap)    # the next heaviest, x <= y
            if y > x:
                heapq.heappush(heap, -(y - x))
        return -heap[0] if heap else 0
