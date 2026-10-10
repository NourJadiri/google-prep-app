class Solution:
    def middleNode(self, head):
        nodes = []
        while head:
            nodes.append(head)
            head = head.next
        return nodes[len(nodes) // 2]
