class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        answer = [0] * len(temperatures)
        # Indices of days still waiting for a warmer day. Their temperatures
        # never rise from bottom to top: a warmer day would have resolved them.
        stack = []
        for i, t in enumerate(temperatures):
            while stack and temperatures[stack[-1]] < t:   # strictly warmer only
                j = stack.pop()
                answer[j] = i - j
            stack.append(i)
        return answer                 # days left on the stack keep their 0
