# Reverses the whole list in place, then compares it with `head` -- but `head`
# is now the tail, a single node, so only the first and last values get compared.
class Solution:
    def isPalindrome(self, head):
        prev, cur = None, head
        while cur:
            nxt = cur.next
            cur.next = prev
            prev, cur = cur, nxt
        a, b = head, prev
        while a and b:
            if a.val != b.val:
                return False
            a, b = a.next, b.next
        return True
