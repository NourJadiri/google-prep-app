class Solution:
    def isSymmetric(self, root: Optional[TreeNode]) -> bool:
        def mirrored(a, b):
            # Are the trees at a and b mirror images of each other?
            if a is None and b is None:     # a gap facing a gap
                return True
            if a is None or b is None:      # a node facing a gap
                return False
            # Facing each other across the middle, the outer children pair
            # up (a.left with b.right) and so do the inner ones.
            return (a.val == b.val
                    and mirrored(a.left, b.right)
                    and mirrored(a.right, b.left))

        return mirrored(root.left, root.right)
