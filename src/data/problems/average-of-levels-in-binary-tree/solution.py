class Solution:
    def averageOfLevels(self, root: Optional[TreeNode]) -> List[float]:
        averages = []
        queue = deque([root])
        while queue:
            # Right now the queue holds exactly one level: none of these
            # nodes' children have been added yet.
            count = len(queue)
            total = 0
            for _ in range(count):
                node = queue.popleft()
                total += node.val
                if node.left:
                    queue.append(node.left)     # next level, waits its turn
                if node.right:
                    queue.append(node.right)
            averages.append(total / count)
        return averages
