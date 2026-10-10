# Pops each zero and appends it while looping by index. The value that slides
# into position i is never looked at, so back-to-back zeros get left behind.
class Solution:
    def moveZeroes(self, nums):
        for i in range(len(nums)):
            if nums[i] == 0:
                nums.pop(i)
                nums.append(0)
