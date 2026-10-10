# Splits on spaces and strips punctuation off the ends of each piece, so
# "red,blue" stays one word and "can't" is never split.
class Solution:
    def mostCommonWord(self, paragraph, banned):
        counts = {}
        for piece in paragraph.lower().split():
            word = piece.strip("!?',;.")
            if word and word not in banned:
                counts[word] = counts.get(word, 0) + 1
        return max(counts, key=counts.get)
