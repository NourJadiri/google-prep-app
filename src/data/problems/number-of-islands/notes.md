## Approach

This is connected-component counting on an implicit graph. Every land cell is a node, and two land cells that share a side are joined by an edge. Scan the cells in any order. The first time the scan reaches an unvisited land cell, that cell belongs to an island nobody has counted yet. Add one, then visit the entire island, so that none of its other cells can trigger another count.

Visiting the entire island is a flood fill. The reference uses an explicit stack, which makes it an iterative DFS. Push the start cell, then keep popping a cell and pushing each of its land neighbours. Instead of a separate `visited` set, it sinks cells by overwriting `"1"` with `"0"`. It sinks a cell when the cell is **pushed**, not when it's popped. Marking on push guarantees that a cell enters the stack only once. Mark on pop instead, and a cell with three land neighbours can be pushed three times before its first pop. That is still correct here, just wasteful. In BFS shortest-path problems, though, the same habit causes real bugs, so build the right reflex now.

Why it's correct: a flood started from a cell reaches exactly the cells connected to it. Every step follows an edge, and every edge out of a visited cell gets examined. So each island is flooded exactly once, at the moment the scan reaches its first cell. The count therefore equals the number of islands.

The recursive version has the same logic and is shorter. Its recursion depth, though, equals the length of the path the DFS walks, and on a solid block of land that path can cover the whole block. On an all-land 300 x 300 grid that's 90,000 nested calls, against Python's default recursion limit of 1,000. In an interview it's fine to write the recursive version, as long as you say this out loud and offer the stack or a BFS queue as the fix.

Union-find is a third option. Union every land cell with its land neighbours below and to the right, then count the roots. It earns its keep when land arrives one cell at a time (Number of Islands II). For a static grid, a flood fill is simpler.

## Complexity

`O(m·n)` time. Every cell is scanned once, and each land cell is pushed and popped once, checking its four neighbours. Extra space is `O(m·n)` in the worst case, for the stack on an all-land grid. Sinking in place avoids a separate visited set. If you're not allowed to modify the input, a `visited` set costs another `O(m·n)`.

## Pitfalls

- Treating diagonal neighbours as connected. Corners don't connect: Example 2 has five islands, not one.
- Flooding only right and down. A scan in reading order still meets islands that curl back up or to the left, like Example 1's right-hand shape. The flood has to try all four directions.
- Comparing cells with the integer `1`. The cells are the strings `"1"` and `"0"`.
- Recursing before sinking or marking the current cell. Two neighbours then keep calling each other forever.
