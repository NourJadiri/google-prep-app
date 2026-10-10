# Floor-divides each level's sum: 5.5 becomes 5, and -0.5 becomes -1.
class Solution:
    def averageOfLevels(self, root):
        out, level = [], [root]
        while level:
            out.append(sum(node.val for node in level) // len(level))
            level = [c for node in level for c in (node.left, node.right) if c]
        return out
