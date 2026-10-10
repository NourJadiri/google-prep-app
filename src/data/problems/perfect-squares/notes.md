## Approach

This is an unbounded knapsack that minimises. The items are the squares `1, 4, 9, …` up to `n`, each usable any number of times, and you want to hit `n` exactly with as few items as possible.

**Subproblem.** `fewest[i]` = the fewest perfect squares that sum to `i`.

**Recurrence.** A best sum for `i` ends with some square `s <= i`. Removing it leaves a sum for `i - s`, and that sum must be a best one too: if it weren't, swapping in a better one would beat the "best" sum for `i`. So `fewest[i] = 1 + min(fewest[i - s])` over all squares `s <= i`.

**Base case.** `fewest[0] = 0`, the empty sum. Starting every other entry at `i` (all ones) gives a safe value to take minima against.

**Fill order.** `i` ascending, since `fewest[i]` reads only smaller indices.

**Why greedy fails.** Taking the largest square first commits too early. `18` becomes `16 + 1 + 1` (3 terms), but `9 + 9` needs only 2. The DP tries every possible last square.

**BFS view.** Make every number a node with an edge `x → x - s` for each square `s`. The answer is the shortest path from `n` to `0`, and breadth-first search finds it level by level. The answer never exceeds 4 (see below), so BFS stops within four levels and in practice often beats the table.

**Top-down.** `f(x) = 1 + min(f(x - s))`, memoised, has the same states. But the recursion runs up to `n` calls deep (`x → x - 1 → …`), far past Python's default limit of 1,000. That's another reason to fill the table bottom-up here.

**The math.** Lagrange's four-square theorem says every positive integer is a sum of four squares. Legendre's three-square theorem says `n` needs all four exactly when `n = 4^a(8b + 7)`. So the answer is 1 if `n` is a square, 2 if `n - a^2` is a square for some `a`, 4 if `n` is `7 mod 8` after dividing out every factor of 4, and 3 otherwise. That's `O(√n)`. It's worth mentioning, but derive the DP first: that's what's being tested.

## Complexity

`O(n·√n)` time: `n` entries, each trying at most `√n` squares, about 670,000 steps at `n = 10^4`. `O(n)` space for the table. BFS has the same worst-case bound. The number-theory check is `O(√n)` time and `O(1)` space.

## Pitfalls

- Largest-square-first greedy (Example 1).
- Starting the table at `0` and taking minima, so every entry stays 0. Start each entry at `i`, or at infinity.
- Splitting `i` into two arbitrary parts, `min(fewest[j] + fewest[i - j])` over every `j`, is correct but `O(n^2)`, too slow at `n = 10^4`. Removing one square at a time is what keeps it `O(n·√n)`.
