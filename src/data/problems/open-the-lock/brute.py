# The same search over integers 0..9999 with plain digit arithmetic and a
# distance table, a different representation from the string BFS.
class Solution:
    def openLock(self, deadends, target):
        dead = [False] * 10000
        for d in deadends:
            dead[int(d)] = True
        goal = int(target)
        if dead[0]:
            return -1
        dist = [-1] * 10000
        dist[0] = 0
        order = [0]
        for code in order:                     # a list that grows while we read it
            if code == goal:
                return dist[code]
            for place in (1, 10, 100, 1000):
                digit = code // place % 10
                for nd in ((digit + 1) % 10, (digit + 9) % 10):
                    nxt = code + (nd - digit) * place
                    if not dead[nxt] and dist[nxt] == -1:
                        dist[nxt] = dist[code] + 1
                        order.append(nxt)
        return -1
