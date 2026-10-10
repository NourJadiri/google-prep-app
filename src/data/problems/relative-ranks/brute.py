class Solution:
    def findRelativeRanks(self, score):
        # An athlete's place is one more than the number of athletes who
        # scored higher.
        answer = []
        for s in score:
            place = 1
            for other in score:
                if other > s:
                    place += 1
            if place == 1:
                answer.append("Gold Medal")
            elif place == 2:
                answer.append("Silver Medal")
            elif place == 3:
                answer.append("Bronze Medal")
            else:
                answer.append(str(place))
        return answer
