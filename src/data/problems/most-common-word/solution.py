class Solution:
    def mostCommonWord(self, paragraph: str, banned: List[str]) -> str:
        # Lowercase every letter and turn everything else into a space, so a
        # plain split() finds exactly the words -- "red,blue" and "can't" too.
        cleaned = "".join(ch.lower() if ch.isalpha() else " " for ch in paragraph)
        banned_set = set(banned)
        counts = Counter(w for w in cleaned.split() if w not in banned_set)
        return counts.most_common(1)[0][0]
