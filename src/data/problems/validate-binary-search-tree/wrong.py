# Checks each node only against its own children. [20,10,30,5,25] passes
# every local check, yet 25 sits in the left subtree of 20.
class Solution:
    def isValidBST(self, root):
        if root is None:
            return True
        if root.left is not None and root.left.val >= root.val:
            return False
        if root.right is not None and root.right.val <= root.val:
            return False
        return self.isValidBST(root.left) and self.isValidBST(root.right)
