class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        # A min-heap holding the current head of every non-empty list. The list
        # index i breaks ties between equal values, so heapq never has to
        # compare two ListNodes (which have no ordering).
        heap = [(node.val, i, node) for i, node in enumerate(lists) if node]
        heapify(heap)
        dummy = tail = ListNode()
        while heap:
            _, i, node = heappop(heap)
            tail.next = node            # reuse the node itself; no copying
            tail = node
            if node.next:
                heappush(heap, (node.next.val, i, node.next))
        return dummy.next
