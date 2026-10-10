import json


class Codec:
    # Level order with nulls, written as JSON: the tests' own notation.
    def serialize(self, root):
        out, queue = [], [root]
        for node in queue:              # the queue grows while we walk it
            if node is None:
                out.append(None)
            else:
                out.append(node.val)
                queue.append(node.left)
                queue.append(node.right)
        while out and out[-1] is None:
            out.pop()
        return json.dumps(out)

    def deserialize(self, data):
        vals = json.loads(data)
        if not vals:
            return None
        root = TreeNode(vals[0])
        queue, i = [root], 1
        for node in queue:
            if i >= len(vals):
                break
            if vals[i] is not None:
                node.left = TreeNode(vals[i])
                queue.append(node.left)
            i += 1
            if i < len(vals) and vals[i] is not None:
                node.right = TreeNode(vals[i])
                queue.append(node.right)
            i += 1
        return root
