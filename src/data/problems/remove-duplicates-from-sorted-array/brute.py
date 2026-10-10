class Solution:
    def removeDuplicates(self, nums):
        distinct = []
        for x in nums:
            if x not in distinct:
                distinct.append(x)
        nums[:len(distinct)] = distinct
        return len(distinct)
