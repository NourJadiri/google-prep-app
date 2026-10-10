# Semester by semester: take every course whose prerequisites are all taken,
# until a semester adds nothing. Everything taken means it can be done.
class Solution:
    def canFinish(self, numCourses, prerequisites):
        needs = [[] for _ in range(numCourses)]
        for a, b in prerequisites:
            needs[a].append(b)
        taken = [False] * numCourses
        progress = True
        while progress:
            progress = False
            for c in range(numCourses):
                if not taken[c] and all(taken[b] for b in needs[c]):
                    taken[c] = True
                    progress = True
        return all(taken)
