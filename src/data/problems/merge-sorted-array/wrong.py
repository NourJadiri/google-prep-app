# Stops as soon as either list runs out. Leftover nums1 values are already in
# place, but leftover nums2 values (smaller than everything in nums1) are
# never copied in.
class Solution:
    def merge(self, nums1, m, nums2, n):
        i, j, write = m - 1, n - 1, m + n - 1
        while i >= 0 and j >= 0:
            if nums1[i] > nums2[j]:
                nums1[write] = nums1[i]
                i -= 1
            else:
                nums1[write] = nums2[j]
                j -= 1
            write -= 1
