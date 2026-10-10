# Numbers the places from zero, so the athlete in fourth place is labelled "3".
class Solution:
    def findRelativeRanks(self, score):
        medals = ["Gold Medal", "Silver Medal", "Bronze Medal"]
        order = sorted(range(len(score)), key=lambda i: -score[i])
        answer = [""] * len(score)
        for place, i in enumerate(order):
            answer[i] = medals[place] if place < 3 else str(place)
        return answer
