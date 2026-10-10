## Approach

Treat the crate as a graph: oranges are nodes, and neighbouring oranges are joined by edges. Rot spreads exactly the way a breadth-first search explores. After one minute it has reached everything at distance 1 from a rotten orange, after two minutes everything at distance 2, and so on. So the answer is the largest distance from any fresh orange to its *nearest* rotten orange.

The nearest of several sources is a job for **multi-source BFS**. Put every rotten orange in the queue at the start, all at distance 0. From there it's an ordinary BFS processed one layer at a time. Each pass of the outer loop is one minute: pop exactly the oranges that were in the queue when the minute began, rot their fresh neighbours, and push those. Layers come out in order of distance, so each orange is first reached from whichever source is closest. No source can overtake another.

Two details keep it tidy:

- Rot an orange when you push it, not when you pop it. Otherwise two rotten neighbours could both push the same fresh orange in the same minute.
- Count the fresh oranges before you start, and decrement the count as they rot. Stop the loop as soon as the count reaches zero, so the final empty round isn't counted as a minute. If the queue runs dry while the count is still above zero, some orange is unreachable: return `-1`.

Why not run a BFS from each rotten orange separately and keep the minimum per cell? It gives the same answer, but costs `O(k·m·n)` for `k` rotten oranges, because it redoes the same work over and over. Why not simulate minute by minute, scanning the grid each minute? That costs `O(minutes·m·n)`, and the minutes can run into the hundreds or thousands. Multi-source BFS touches each orange once.

DFS is the wrong shape here. It follows one long winding path before trying the short ones, so the first time it reaches an orange is not necessarily the earliest minute. Fixing that means revisiting cells whenever a shorter route turns up, which is far more work than a BFS.

## Complexity

`O(m·n)` time: one scan to set up, then each orange enters and leaves the queue at most once. `O(m·n)` space for the queue in the worst case.

## Pitfalls

- Counting one minute too many. A loop that adds a minute after every round also counts the last round, which rots nothing. It also returns `1` for a crate with nothing fresh.
- Forgetting the `-1` case: a fresh orange cut off by empty cells.
- Treating diagonal neighbours as touching.
- Starting the BFS from only the first rotten orange found. All sources must start together, or the minutes come out too long.
