# Trusts the frame count alone: when there are enough different tasks to fill
# every gap, nothing idles and the answer is len(tasks), which can be larger.
class Solution:
    def leastInterval(self, tasks, n):
        counts = Counter(tasks).values()
        top = max(counts)
        ties = sum(1 for c in counts if c == top)
        return (top - 1) * (n + 1) + ties
