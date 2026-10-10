# Reduces the tree to the street version: sums each level, then robs
# non-adjacent levels. But the best set needn't take whole levels — in
# [2,1,3,null,4] it takes 3 and 4, which share no level.
class Solution:
    def rob(self, root):
        sums, level = [], [root]
        while level:
            sums.append(sum(node.val for node in level))
            level = [c for node in level for c in (node.left, node.right) if c]
        take = skip = 0
        for s in sums:
            take, skip = skip + s, max(take, skip)
        return max(take, skip)
