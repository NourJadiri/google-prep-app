class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev = None
        cur = head
        while cur:
            nxt = cur.next      # save the rest of the list before the link turns
            cur.next = prev     # turn the link
            prev, cur = cur, nxt
        return prev             # cur fell off the end; prev is the old tail
