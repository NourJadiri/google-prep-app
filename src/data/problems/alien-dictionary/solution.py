class Solution:
    def alienOrder(self, words: List[str]) -> str:
        # Every letter that appears is a node, constrained or not.
        succ = {ch: set() for word in words for ch in word}
        indegree = {ch: 0 for ch in succ}

        # Only adjacent words matter: the order is transitive, so a pair further
        # apart can't say anything the chain of pairs between them doesn't.
        for a, b in zip(words, words[1:]):
            for x, y in zip(a, b):
                if x != y:                       # the first difference is the only rule this pair gives
                    if y not in succ[x]:
                        succ[x].add(y)
                        indegree[y] += 1
                    break
            else:
                if len(a) > len(b):              # a word listed after its own extension
                    return ""

        # Kahn's algorithm: repeatedly emit a letter nothing still has to precede.
        queue = deque(ch for ch, d in indegree.items() if d == 0)
        order = []
        while queue:
            ch = queue.popleft()
            order.append(ch)
            for nxt in succ[ch]:
                indegree[nxt] -= 1
                if indegree[nxt] == 0:
                    queue.append(nxt)

        # Letters on a cycle never reach indegree 0, so they never get emitted.
        return "".join(order) if len(order) == len(indegree) else ""
