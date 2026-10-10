class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        # dq holds indices whose values strictly decrease from front to back.
        # The front is the current window's maximum; each index behind it is
        # the maximum-in-waiting for when everything ahead of it has left.
        dq = deque()
        out = []
        for i, x in enumerate(nums):
            if dq and dq[0] <= i - k:       # the front just slid out of the window
                dq.popleft()
            while dq and nums[dq[-1]] <= x:
                dq.pop()                    # x is newer and at least as big: they can never be a maximum again
            dq.append(i)
            if i >= k - 1:                  # the first full window ends at index k - 1
                out.append(nums[dq[0]])
        return out
