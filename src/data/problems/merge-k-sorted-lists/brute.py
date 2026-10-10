class Solution:
    def mergeKLists(self, lists):
        vals = []
        for node in lists:
            while node:
                vals.append(node.val)
                node = node.next
        dummy = tail = ListNode()
        for v in sorted(vals):
            tail.next = ListNode(v)
            tail = tail.next
        return dummy.next
