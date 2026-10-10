class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
        view = []
        level = [root] if root else []
        while level:
            view.append(level[-1].val)      # the last node of a level is the one you see
            # The next level, still left to right.
            level = [child for node in level for child in (node.left, node.right) if child]
        return view
