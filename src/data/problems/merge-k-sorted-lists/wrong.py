# No tie-breaker in the heap entries: when two heads hold the same value,
# heapq falls through to comparing the ListNodes themselves, which raises
# TypeError.
class Solution:
    def mergeKLists(self, lists):
        heap = [(node.val, node) for node in lists if node]
        heapify(heap)
        dummy = tail = ListNode()
        while heap:
            _, node = heappop(heap)
            tail.next = node
            tail = node
            if node.next:
                heappush(heap, (node.next.val, node.next))
        return dummy.next
