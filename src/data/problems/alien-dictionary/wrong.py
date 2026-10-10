# Never checks for a word listed after its own extension (["ab", "a"]):
# such a pair gives no edge, so the list looks consistent.
class Solution:
    def alienOrder(self, words):
        succ = {ch: set() for w in words for ch in w}
        indegree = {ch: 0 for ch in succ}
        for a, b in zip(words, words[1:]):
            for x, y in zip(a, b):
                if x != y:
                    if y not in succ[x]:
                        succ[x].add(y)
                        indegree[y] += 1
                    break
        queue = deque(ch for ch in indegree if indegree[ch] == 0)
        order = []
        while queue:
            ch = queue.popleft()
            order.append(ch)
            for nxt in succ[ch]:
                indegree[nxt] -= 1
                if indegree[nxt] == 0:
                    queue.append(nxt)
        return "".join(order) if len(order) == len(indegree) else ""
