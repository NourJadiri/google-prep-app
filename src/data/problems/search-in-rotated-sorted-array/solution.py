class Solution:
    def search(self, nums: List[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                return mid
            # The rotation leaves at most one drop, so at least one of the two
            # halves around mid is in order. Only that half's ends say for sure
            # whether target can be inside it.
            if nums[lo] <= nums[mid]:                # [lo, mid] is sorted (<=: lo may equal mid)
                if nums[lo] <= target < nums[mid]:
                    hi = mid - 1
                else:
                    lo = mid + 1
            else:                                     # [mid, hi] is sorted
                if nums[mid] < target <= nums[hi]:
                    lo = mid + 1
                else:
                    hi = mid - 1
        return -1
