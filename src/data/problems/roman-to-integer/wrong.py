# Adds every symbol, and when a symbol is bigger than the one before it,
# takes the smaller one back off -- but only once. It was already added, so
# it has to come off twice: this reads "IV" as 5.
class Solution:
    def romanToInt(self, s):
        value = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
        total, prev = 0, 0
        for ch in s:
            v = value[ch]
            if v > prev:
                total += v - prev
            else:
                total += v
            prev = v
        return total
