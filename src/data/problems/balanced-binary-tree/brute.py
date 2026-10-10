class Solution:
    def isBalanced(self, root):
        # Straight from the definition: at every node, measure both subtree
        # heights from scratch and compare them.
        def height(node):
            if node is None:
                return 0
            return 1 + max(height(node.left), height(node.right))

        stack = [root] if root else []
        while stack:
            node = stack.pop()
            if abs(height(node.left) - height(node.right)) > 1:
                return False
            if node.left:
                stack.append(node.left)
            if node.right:
                stack.append(node.right)
        return True
