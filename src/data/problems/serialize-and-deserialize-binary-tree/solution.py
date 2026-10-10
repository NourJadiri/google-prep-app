class Codec:

    def serialize(self, root: Optional[TreeNode]) -> str:
        # Preorder, writing "#" for every missing child. The markers pin down
        # the shape, so reading the string back never has to guess.
        out = []

        def write(node):
            if node is None:
                out.append("#")
                return
            out.append(str(node.val))
            write(node.left)
            write(node.right)

        write(root)
        return ",".join(out)    # a separator, so "-12" stays one value

    def deserialize(self, data: str) -> Optional[TreeNode]:
        tokens = iter(data.split(","))

        def read():
            # Consumes exactly the tokens of one subtree, in the order write() made them.
            token = next(tokens)
            if token == "#":
                return None
            node = TreeNode(int(token))
            node.left = read()
            node.right = read()
            return node

        return read()
