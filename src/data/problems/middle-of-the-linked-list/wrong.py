# Stops fast one step early, so an even-length list gives the first of the two
# middle nodes instead of the second.
class Solution:
    def middleNode(self, head):
        slow = fast = head
        while fast.next and fast.next.next:
            slow = slow.next
            fast = fast.next.next
        return slow
