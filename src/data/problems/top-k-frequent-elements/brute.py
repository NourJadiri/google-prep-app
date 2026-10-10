class Solution:
    def topKFrequent(self, nums, k):
        values = list(set(nums))
        values.sort(key=lambda v: nums.count(v), reverse=True)
        return values[:k]
