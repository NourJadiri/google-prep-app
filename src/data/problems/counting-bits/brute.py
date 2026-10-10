class Solution:
    def countBits(self, n):
        # Write each number in binary and count the 1s.
        return [bin(i).count("1") for i in range(n + 1)]
