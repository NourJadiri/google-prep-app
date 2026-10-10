class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = tail = ListNode()   # a placeholder in front, so the first node isn't a special case
        while list1 and list2:
            # Take the smaller front node. On a tie either works; taking from
            # list1 first keeps equal values in their original order.
            if list1.val <= list2.val:
                tail.next = list1
                list1 = list1.next
            else:
                tail.next = list2
                list2 = list2.next
            tail = tail.next
        tail.next = list1 or list2  # one list is used up; the rest of the other is already sorted
        return dummy.next
