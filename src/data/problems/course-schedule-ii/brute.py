# Repeatedly take the smallest-numbered course whose prerequisites are all
# taken. If at some point no course qualifies, the rest are stuck.
class Solution:
    def findOrder(self, numCourses, prerequisites):
        needs = [set() for _ in range(numCourses)]
        for a, b in prerequisites:
            needs[a].add(b)
        order, taken = [], set()
        while len(order) < numCourses:
            for c in range(numCourses):
                if c not in taken and needs[c] <= taken:
                    order.append(c)
                    taken.add(c)
                    break
            else:
                return []
        return order
