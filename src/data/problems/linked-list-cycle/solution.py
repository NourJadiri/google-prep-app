class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow = fast = head
        while fast and fast.next:
            slow = slow.next          # one step
            fast = fast.next.next     # two steps
            if slow is fast:          # the fast pointer lapped the slow one
                return True
        return False                  # fast fell off the end: no loop
