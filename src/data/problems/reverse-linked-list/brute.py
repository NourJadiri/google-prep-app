class Solution:
    def reverseList(self, head):
        vals = []
        while head:
            vals.append(head.val)
            head = head.next
        dummy = tail = ListNode()
        for v in reversed(vals):
            tail.next = ListNode(v)
            tail = tail.next
        return dummy.next
