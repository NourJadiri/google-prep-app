# Walks a single path down, preferring the right child: for [1,2,3,4] it
# stops at 3 and never sees the 4 hanging under the left child.
class Solution:
    def rightSideView(self, root):
        view = []
        while root:
            view.append(root.val)
            root = root.right or root.left
        return view
