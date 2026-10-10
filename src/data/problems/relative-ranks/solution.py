class Solution:
    def findRelativeRanks(self, score: List[int]) -> List[str]:
        medals = ["Gold Medal", "Silver Medal", "Bronze Medal"]
        # Sort the athletes' indices, not their scores, so each position in
        # the order still says which athlete finished there.
        order = sorted(range(len(score)), key=lambda i: score[i], reverse=True)
        answer = [""] * len(score)
        for place, i in enumerate(order):       # place 0 is first place
            answer[i] = medals[place] if place < 3 else str(place + 1)
        return answer
