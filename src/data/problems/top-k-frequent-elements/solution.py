class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        count = Counter(nums)
        # No value can occur more than len(nums) times, so a frequency is a
        # valid index: buckets[f] holds every value seen exactly f times.
        buckets = [[] for _ in range(len(nums) + 1)]
        for x, f in count.items():
            buckets[f].append(x)
        out = []
        for f in range(len(nums), 0, -1):   # highest frequency first
            for x in buckets[f]:
                out.append(x)
                if len(out) == k:
                    return out
        return out
