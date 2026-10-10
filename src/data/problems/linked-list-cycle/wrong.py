# Compares values, not nodes: equal values look like a loop.
class Solution:
    def hasCycle(self, head):
        seen = set()
        while head:
            if head.val in seen:
                return True
            seen.add(head.val)
            head = head.next
        return False
