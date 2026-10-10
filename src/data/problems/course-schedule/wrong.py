# One visited set doing two jobs: any course reached a second time counts as a
# cycle, so two routes to the same course (a diamond) look like a loop.
class Solution:
    def canFinish(self, numCourses, prerequisites):
        unlocks = [[] for _ in range(numCourses)]
        for a, b in prerequisites:
            unlocks[b].append(a)
        visited = set()

        def dfs(course):
            if course in visited:
                return False
            visited.add(course)
            for nxt in unlocks[course]:
                if not dfs(nxt):
                    return False
            return True

        for c in range(numCourses):
            if c not in visited and not dfs(c):
                return False
        return True
