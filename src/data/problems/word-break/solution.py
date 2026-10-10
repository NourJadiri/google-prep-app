class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        words = set(wordDict)
        lengths = sorted({len(w) for w in words})
        n = len(s)
        # dp[i]: the first i characters of s split cleanly into words.
        # The empty prefix needs no words, so dp[0] is True.
        dp = [True] + [False] * n
        for i in range(1, n + 1):
            # Some word must end exactly at i; try only the lengths that exist.
            for size in lengths:
                if size > i:
                    break
                if dp[i - size] and s[i - size:i] in words:
                    dp[i] = True
                    break
        return dp[n]
