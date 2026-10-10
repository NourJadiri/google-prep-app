class Solution:
    def validPath(self, n, edges, source, destination):
        # Grow the set of reachable machines one sweep over the cables at a
        # time: a cable with exactly one reached end brings in the other end.
        # Stop when a full sweep adds nothing.
        reached = {source}
        grew = True
        while grew:
            grew = False
            for u, v in edges:
                if (u in reached) != (v in reached):
                    reached.add(u)
                    reached.add(v)
                    grew = True
        return destination in reached
