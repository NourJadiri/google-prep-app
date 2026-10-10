# Build the graph explicitly by comparing every pair of words letter by letter,
# then run a plain BFS with a distance table.
class Solution:
    def ladderLength(self, beginWord, endWord, wordList):
        nodes = [beginWord] + [w for w in wordList if w != beginWord]

        def one_apart(a, b):
            return sum(x != y for x, y in zip(a, b)) == 1

        adj = {w: [] for w in nodes}
        for i in range(len(nodes)):
            for j in range(i + 1, len(nodes)):
                if one_apart(nodes[i], nodes[j]):
                    adj[nodes[i]].append(nodes[j])
                    adj[nodes[j]].append(nodes[i])
        if endWord not in adj or endWord not in wordList:
            return 0
        dist = {beginWord: 1}
        order = [beginWord]
        for w in order:
            for v in adj[w]:
                if v not in dist:
                    dist[v] = dist[w] + 1
                    order.append(v)
        return dist.get(endWord, 0)
