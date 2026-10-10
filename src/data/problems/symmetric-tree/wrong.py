# Checks that each level's values read the same both ways, but skips the
# missing children, so a lopsided shape with matching values passes.
class Solution:
    def isSymmetric(self, root):
        row = [root]
        while row:
            vals = [node.val for node in row]
            if vals != vals[::-1]:
                return False
            row = [c for node in row for c in (node.left, node.right) if c]
        return True
