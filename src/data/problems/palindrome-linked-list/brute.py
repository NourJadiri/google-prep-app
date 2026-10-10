class Solution:
    def isPalindrome(self, head):
        values = []
        while head:
            values.append(head.val)
            head = head.next
        return values == values[::-1]
