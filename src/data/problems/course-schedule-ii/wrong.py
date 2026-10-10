# Forgets the leftover check: when some courses are stuck on a cycle, it
# returns the partial order instead of [].
class Solution:
    def findOrder(self, numCourses, prerequisites):
        unlocks = [[] for _ in range(numCourses)]
        waiting = [0] * numCourses
        for a, b in prerequisites:
            unlocks[b].append(a)
            waiting[a] += 1
        ready = deque(c for c in range(numCourses) if waiting[c] == 0)
        order = []
        while ready:
            course = ready.popleft()
            order.append(course)
            for nxt in unlocks[course]:
                waiting[nxt] -= 1
                if waiting[nxt] == 0:
                    ready.append(nxt)
        return order
