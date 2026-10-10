class Solution:
    def mergeTwoLists(self, list1, list2):
        values = []
        for node in (list1, list2):
            while node:
                values.append(node.val)
                node = node.next
        values.sort()
        head = None
        for v in reversed(values):
            head = ListNode(v, head)
        return head
