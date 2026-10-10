class Solution:
    def hasCycle(self, head):
        seen = set()
        while head:
            if id(head) in seen:
                return True
            seen.add(id(head))
            head = head.next
        return False
