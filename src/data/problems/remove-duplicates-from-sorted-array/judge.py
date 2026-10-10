# removeDuplicates returns k and rearranges nums in place; the tests compare
# nums[:k] after the call with the distinct values. k is checked first: a k
# past the end (or a negative one) could slice out a matching list by
# accident, and True would pass for 1.

def run(fn, args):
    nums = args[0]
    k = fn(nums)
    if isinstance(k, bool) or not isinstance(k, int):
        raise TypeError("removeDuplicates must return k, the number of distinct values, as an int;"
                        " it returned " + repr(k)[:80] + ".")
    if not 1 <= k <= len(nums):
        raise ValueError("removeDuplicates returned k = " + str(k) + ", but k must be between 1 and"
                         " len(nums) = " + str(len(nums)) + ".")
    return nums[:k]
