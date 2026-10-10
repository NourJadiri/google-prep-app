class Solution:
    def isPalindrome(self, head: Optional[ListNode]) -> bool:
        # 1. Find the middle: when fast runs out, slow is at the start of the
        #    second half (the exact middle node when the length is odd).
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

        # 2. Reverse the second half, so it can be read from the end inwards.
        prev = None
        while slow:
            nxt = slow.next
            slow.next = prev
            prev, slow = slow, nxt

        # 3. Walk in from both ends. The reversed half is never longer than the
        #    first half, so it decides when to stop.
        left, right = head, prev
        while right:
            if left.val != right.val:
                return False
            left, right = left.next, right.next
        return True
