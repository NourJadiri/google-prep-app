# Loses the last node: stops one step early.
class Solution:
    def reverseList(self, head):
        prev, cur = None, head
        while cur and cur.next:
            nxt = cur.next
            cur.next = prev
            prev, cur = cur, nxt
        return prev
