# Preorder with "#" markers but no separator, read back one character at a
# time: fine while every value is a single digit, broken by "-3" or "25".
class Codec:
    def serialize(self, root):
        if root is None:
            return "#"
        return str(root.val) + self.serialize(root.left) + self.serialize(root.right)

    def deserialize(self, data):
        chars = iter(data)

        def read():
            ch = next(chars)
            if ch == "#":
                return None
            node = TreeNode(int(ch))
            node.left = read()
            node.right = read()
            return node

        return read()
