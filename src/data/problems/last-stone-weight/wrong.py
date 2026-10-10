# Sorts once, then keeps smashing from the top without re-sorting, as if the
# leftover piece were always the heaviest stone in the pile.
class Solution:
    def lastStoneWeight(self, stones):
        pile = sorted(stones)
        while len(pile) > 1:
            y = pile.pop()
            x = pile.pop()
            if y != x:
                pile.append(y - x)
        return pile[0] if pile else 0
