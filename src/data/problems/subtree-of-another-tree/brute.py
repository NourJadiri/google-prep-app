class Solution:
    def isSubtree(self, root, subRoot):
        # Write a tree out in preorder with a marker for every missing child:
        # that sequence pins the tree down exactly. Compare subRoot's sequence
        # with the sequence of the subtree under every node of root.
        def written(node):
            out, stack = [], [node]
            while stack:
                n = stack.pop()
                if n is None:
                    out.append("#")
                else:
                    out.append(n.val)
                    stack.append(n.right)
                    stack.append(n.left)
            return out

        target = written(subRoot)
        stack = [root]
        while stack:
            n = stack.pop()
            if n is not None:
                if written(n) == target:
                    return True
                stack.append(n.left)
                stack.append(n.right)
        return False
