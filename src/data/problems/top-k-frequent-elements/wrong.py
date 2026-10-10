# Off by one: the bucket array has len(nums) slots, so a value that fills the
# whole list (frequency len(nums)) has no bucket to land in.
class Solution:
    def topKFrequent(self, nums, k):
        count = Counter(nums)
        buckets = [[] for _ in range(len(nums))]
        for x, f in count.items():
            buckets[f].append(x)
        out = []
        for f in range(len(nums) - 1, 0, -1):
            for x in buckets[f]:
                out.append(x)
                if len(out) == k:
                    return out
        return out
