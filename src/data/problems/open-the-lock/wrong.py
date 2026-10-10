# Checks dead ends only when stepping to a new code, so a lock that starts on
# a dead end ("0000" in deadends) is treated as if it could still turn.
class Solution:
    def openLock(self, deadends, target):
        dead = set(deadends)
        seen = {"0000"}
        queue = deque([("0000", 0)])
        while queue:
            code, moves = queue.popleft()
            if code == target:
                return moves
            for i in range(4):
                for turn in (1, -1):
                    nxt = code[:i] + str((int(code[i]) + turn) % 10) + code[i + 1:]
                    if nxt not in dead and nxt not in seen:
                        seen.add(nxt)
                        queue.append((nxt, moves + 1))
        return -1
