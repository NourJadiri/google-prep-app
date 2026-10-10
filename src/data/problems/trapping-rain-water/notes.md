## Approach

**The level over one bar.** Water above bar `i` rises until it would spill. It is held by the tallest bar on its left and the tallest bar on its right, and it spills over the lower of those two. So the level is `min(maxLeft(i), maxRight(i))` — both maxima including bar `i` itself — and the water there is that level minus `height[i]`. Sum that over every bar. The whole question is how cheaply you can know both maxima.

**Two pointers.** Start `left` and `right` at the two ends, with `left_max` the tallest bar in `[0..left]` and `right_max` the tallest in `[right..n-1]`. At each step, settle whichever end has the lower bar:

- If `height[left] < height[right]`, the right side already holds a bar taller than anything the left pointer has seen: every bar it walked past was lower than the right-hand bar of that moment, and `height[left]` is lower than `height[right]`. So for position `left` the left maximum is the smaller one, and its level is exactly `left_max`. Add `left_max - height[left]` and step right.
- Otherwise the mirror argument settles position `right` with `right_max`.

Each bar is settled exactly once, with the level the definition demands, so the sum is the answer. The trick to say out loud: *you never need the far side's exact maximum, only the knowledge that it's at least as tall as this side's.*

**Other `O(n)` ways.** Two passes that fill `maxLeft[]` and `maxRight[]`, then one pass to sum — the clearest correct answer and a good first step, at `O(n)` extra space. Or a monotonic stack of indices with falling heights: when a taller bar arrives, each popped bar is the floor of a pool bounded by the new bar and the bar now on top of the stack, and that layer of water is `(min(the two walls) - floor) * width`.

## Complexity

Two pointers: `O(n)` time — every step moves one pointer inward — and `O(1)` extra space. Prefix and suffix arrays: `O(n)` time and space. Recomputing both maxima for every bar: `O(n^2)`.

## Pitfalls

- Using maxima that exclude bar `i` and forgetting to clamp at zero: a bar taller than everything around it then holds negative water.
- Moving the pointer on the taller side: that side's running maximum no longer bounds its level.
- Thinking one tall wall is enough. Water needs walls on both sides; the lower of the two decides.
