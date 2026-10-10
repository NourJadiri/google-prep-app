## Approach

**The pattern: local counting on a grid.** Some grid questions need a search (BFS or DFS) because the answer depends on how cells connect to each other. This one doesn't: the perimeter is a sum of small, local facts. Every unit of coastline is one side of one land cell — a side with land on one side and water, or the end of the map, on the other. So visit every cell, and for each land cell look at its four neighbours:

- the neighbour is off the grid: that side is coastline (everything beyond the map is sea);
- the neighbour is water: coastline;
- the neighbour is land: that side is inland, so it doesn't count.

Add 1 per coastline side and you're done. The four-neighbour check — `(r - 1, c)`, `(r + 1, c)`, `(r, c - 1)`, `(r, c + 1)`, each with a bounds test — is the same building block that drives flood fill and every grid BFS. Here it's used on its own, without a search wrapped around it.

**A shortcut.** Every land cell starts with 4 sides, and every pair of side-by-side land cells hides 2 of them, one from each cell. So `perimeter = 4 * land - 2 * shared`, where `shared` counts each touching pair once. To count each pair exactly once, look only at the neighbour below and the neighbour to the right.

**The search version.** You can also DFS over the island from any land cell. Stepping into water or off the map adds 1 (you just crossed one side of coastline); stepping onto land you've already visited adds 0; a fresh land cell adds up the answers from its four neighbours. Same total, and good practice for grid recursion — but more code than the plain loop, for no gain here.

**Why it's correct.** The coastline is made of unit sides that separate land from non-land. Each such side has exactly one land cell next to it, and we examine every side of every land cell exactly once, so each piece of coastline is counted exactly once and inland sides never are. The "no lakes" rule matters: a lake's shore is also land beside water, and this count would include it. The problem promises there are no lakes, so "land beside water" and "coastline" mean the same thing.

**Spotting it next time.** When the answer is a total over cells — a perimeter, an area, how many cells have some property — ask whether each cell's share can be worked out from the cell and its neighbours alone. If it can, a plain double loop beats a search.

## Complexity

`O(rows * cols)` time: every cell is visited once and checks at most four neighbours. `O(1)` extra space.

## Pitfalls

- Forgetting the map's edge. A land cell on the border has coastline facing outward even though there's no water cell there to find.
- In the shortcut, subtracting 1 per shared side instead of 2 — or subtracting 2 while checking all four directions, which counts every pair twice.
- In a DFS, marking visited cells with a new value (say `2`) and then treating anything that isn't `1` as water: visited land isn't coastline.
