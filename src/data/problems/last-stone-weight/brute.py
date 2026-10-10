class Solution:
    def lastStoneWeight(self, stones):
        # Follow the rules literally: sort, smash the two heaviest, put any
        # remainder back, and sort again next round.
        pile = list(stones)
        while len(pile) > 1:
            pile.sort()
            y = pile.pop()
            x = pile.pop()
            if y != x:
                pile.append(y - x)
        return pile[0] if pile else 0
