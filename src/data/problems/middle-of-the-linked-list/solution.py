class Solution:
    def middleNode(self, head: Optional[ListNode]) -> Optional[ListNode]:
        slow = fast = head
        # fast moves two nodes for every one that slow moves. Checking `fast`
        # and `fast.next` lets fast take its last step onto the final node
        # when the length is odd, or past it when it's even.
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
        return slow     # fast has covered the whole list, so slow is halfway
