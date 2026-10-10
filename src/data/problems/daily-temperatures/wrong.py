# Pops on <= instead of <: a day of EQUAL temperature is treated as warmer.
class Solution:
    def dailyTemperatures(self, temperatures):
        answer = [0] * len(temperatures)
        stack = []
        for i, t in enumerate(temperatures):
            while stack and temperatures[stack[-1]] <= t:
                j = stack.pop()
                answer[j] = i - j
            stack.append(i)
        return answer
