# Label propagation: every city keeps the smallest index it can see, until
# nothing changes. Each province ends up wearing one label.
class Solution:
    def findCircleNum(self, isConnected):
        n = len(isConnected)
        label = list(range(n))
        changed = True
        while changed:
            changed = False
            for i in range(n):
                for j in range(n):
                    if isConnected[i][j] and label[j] < label[i]:
                        label[i] = label[j]
                        changed = True
        return len(set(label))
