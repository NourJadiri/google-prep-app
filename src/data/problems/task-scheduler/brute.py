# Builds a schedule one time unit at a time: run the available label with the
# most copies left, or idle if every label with work left is cooling down.
class Solution:
    def leastInterval(self, tasks, n):
        left = {}
        for t in tasks:
            left[t] = left.get(t, 0) + 1
        ready = {t: 0 for t in left}        # earliest time each label may run
        time, todo = 0, len(tasks)
        while todo:
            best = None
            for t in left:
                if left[t] > 0 and ready[t] <= time and (best is None or left[t] > left[best]):
                    best = t
            if best is not None:
                left[best] -= 1
                ready[best] = time + n + 1
                todo -= 1
            time += 1
        return time
