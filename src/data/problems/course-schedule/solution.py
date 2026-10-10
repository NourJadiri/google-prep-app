class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        unlocks = [[] for _ in range(numCourses)]   # b -> the courses that need b
        waiting = [0] * numCourses                  # prerequisites each course still lacks
        for a, b in prerequisites:
            unlocks[b].append(a)
            waiting[a] += 1

        ready = deque(c for c in range(numCourses) if waiting[c] == 0)
        taken = 0
        while ready:
            course = ready.popleft()
            taken += 1
            for nxt in unlocks[course]:
                waiting[nxt] -= 1
                if waiting[nxt] == 0:               # its last prerequisite just got done
                    ready.append(nxt)
        # A course never taken sits on a cycle, or waits on one.
        return taken == numCourses
