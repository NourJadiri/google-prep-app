# Off by one when expiring the front: an index leaves the deque one step too
# late, so every window is effectively k + 1 wide.
class Solution:
    def maxSlidingWindow(self, nums, k):
        dq = deque()
        out = []
        for i, x in enumerate(nums):
            if dq and dq[0] < i - k:
                dq.popleft()
            while dq and nums[dq[-1]] <= x:
                dq.pop()
            dq.append(i)
            if i >= k - 1:
                out.append(nums[dq[0]])
        return out
