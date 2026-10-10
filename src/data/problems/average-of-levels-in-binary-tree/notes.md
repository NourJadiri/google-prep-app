## Approach

**"Level" means breadth-first search.** The recursion from the earlier tree problems is depth-first: it dives to the bottom of one branch before it touches the next, so the nodes of one level get visited at scattered moments. Breadth-first search (BFS) visits nodes in order of their distance from the root — all of level 1, then all of level 2, and so on — which is exactly the grouping this problem wants.

BFS runs on a queue, first in, first out: take a node from the front, put its children at the back. Children always join behind everything that's already waiting, so every node of a level comes out before any of their children do.

The one thing to add is a way to see where a level ends. At the moment you start a level, the queue holds **exactly** that level's nodes — none of their children have been added yet. So read `count = len(queue)` once, then take out exactly `count` nodes: add each value to a running total and put each node's children at the back. Those children are the next level, and they wait their turn. After `count` nodes, `total / count` is the level's average.

Trace Example 1, `[10,4,7,null,1,0]`. The queue starts as `[10]`: count 1, average `10.0`, and the queue becomes `[4, 7]`. Count 2: total `11`, average `5.5`; meanwhile `1` (child of `4`) and `0` (child of `7`) join, so the queue is `[1, 0]`. Count 2: total `1`, average `0.5`. The queue is empty, so we're done.

A Python-flavoured version of the same idea: keep the current level as a list, build the next level as the list of all their children, and repeat until the list is empty.

Use `/`, not `//`. In Python 3, `/` always gives a float. `//` rounds down, which turns `5.5` into `5` — and because it rounds toward minus infinity, it turns `-0.5` into `-1`.

How to spot it next time: any question about levels, rows, depth by depth, or "the nearest something going outward from the root". That's BFS with a level-size snapshot, and you'll meet the same loop again in level order traversal, the right side view of a tree, minimum depth, and shortest paths through a grid.

## Complexity

`O(n)` time: each node enters and leaves the queue once. `O(w)` extra space, where `w` is the largest number of nodes on a single level — up to about `n/2` for a full tree.

## Pitfalls

- Floor division, `//`, instead of `/`.
- Mixing levels. Without the size snapshot, children of the current level get pulled into the same average.
- A plain list with `pop(0)` as the queue: every `pop(0)` shifts all the remaining items, `O(n)` per pop. Use `collections.deque` with `popleft()`, or build each next level as a fresh list.
