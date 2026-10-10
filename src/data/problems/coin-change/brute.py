class Solution:
    def coinChange(self, coins, amount):
        # Breadth-first over "money still owed": paying one coin is one step,
        # so the first level that reaches 0 uses the fewest coins.
        owed = [amount]
        seen = {amount}
        steps = 0
        while owed:
            if 0 in owed:
                return steps
            nxt = []
            for left in owed:
                for c in coins:
                    rest = left - c
                    if rest >= 0 and rest not in seen:
                        seen.add(rest)
                        nxt.append(rest)
            owed = nxt
            steps += 1
        return -1
