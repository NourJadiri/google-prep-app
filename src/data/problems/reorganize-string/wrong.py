# Checks feasibility against n // 2 instead of (n + 1) // 2: an odd-length
# string whose top letter takes every other slot — "aba", or even "x" — is
# wrongly declared impossible.
class Solution:
    def reorganizeString(self, s):
        counts = Counter(s)
        if max(counts.values()) > len(s) // 2:
            return ""
        heap = [(-c, ch) for ch, c in counts.items()]
        heapq.heapify(heap)
        out = []
        held = None
        while heap:
            c, ch = heapq.heappop(heap)
            out.append(ch)
            if held:
                heapq.heappush(heap, held)
            held = (c + 1, ch) if c + 1 < 0 else None
        return "".join(out)
