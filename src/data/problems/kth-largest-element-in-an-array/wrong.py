# Aims at the wrong end: index k - 1 of the ascending order holds the k-th
# *smallest* value, not the k-th largest.
class Solution:
    def findKthLargest(self, nums, k):
        target = k - 1
        lo, hi = 0, len(nums) - 1
        while True:
            pivot = nums[random.randint(lo, hi)]
            lt, i, gt = lo, lo, hi
            while i <= gt:
                if nums[i] < pivot:
                    nums[lt], nums[i] = nums[i], nums[lt]
                    lt += 1
                    i += 1
                elif nums[i] > pivot:
                    nums[i], nums[gt] = nums[gt], nums[i]
                    gt -= 1
                else:
                    i += 1
            if target < lt:
                hi = lt - 1
            elif target > gt:
                lo = gt + 1
            else:
                return pivot
