class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        # In ascending order the k-th largest sits at index n - k. Quickselect
        # keeps narrowing [lo, hi] around that index without sorting the rest.
        target = len(nums) - k
        lo, hi = 0, len(nums) - 1
        while True:
            pivot = nums[random.randint(lo, hi)]
            # Three-way partition of nums[lo..hi]:
            #   [lo, lt) < pivot,  [lt, gt] == pivot,  (gt, hi] > pivot.
            # Grouping the equal values is what keeps duplicate-heavy input linear.
            lt, i, gt = lo, lo, hi
            while i <= gt:
                if nums[i] < pivot:
                    nums[lt], nums[i] = nums[i], nums[lt]
                    lt += 1
                    i += 1
                elif nums[i] > pivot:
                    nums[i], nums[gt] = nums[gt], nums[i]
                    gt -= 1          # don't advance i: the swapped-in value is unseen
                else:
                    i += 1
            if target < lt:
                hi = lt - 1
            elif target > gt:
                lo = gt + 1
            else:
                return pivot         # target landed in the block equal to the pivot
