class Solution:
    def canPartition(self, nums):
        total = sum(nums)

        # Put each number into group A or group B, never letting a group grow
        # past half the total, and succeed if the two end up equal.
        def place(i, a, b):
            if i == len(nums):
                return a == b
            x = nums[i]
            if 2 * (a + x) <= total and place(i + 1, a + x, b):
                return True
            if 2 * (b + x) <= total and place(i + 1, a, b + x):
                return True
            return False

        return place(0, 0, 0)
