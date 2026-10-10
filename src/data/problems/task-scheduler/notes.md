## Approach

Let `top` be the largest number of copies any label has, and `ties` the number of labels with exactly `top` copies.

**Two lower bounds.** Every task occupies a unit, so the answer is at least `len(tasks)`. Now take a label with `top` copies, say `A`. Between consecutive `A`s at least `n` other units must pass, so the schedule contains `top - 1` stretches of "an `A`, then `n` more units", each `n + 1` long. Every label tied at `top` still has a copy left after the last of those stretches, so at least `ties` more units follow. That gives a second bound:

`(top - 1) * (n + 1) + ties`

**The larger bound is always achievable.** Picture `top` rows. The first `top - 1` rows are `n + 1` slots wide, and the last row holds only the labels tied at `top`. Fill the grid column by column with the labels in decreasing order of count: each tied label fills a whole column, one copy per row, and the remaining labels are dealt across the first `top - 1` rows. Every label has at most `top` copies, so its copies land in different rows, a full row-width apart. Dealing in decreasing order of count is what keeps this true when a label wraps from one column into the next.

- If the tasks run out before the grid is full, the blanks are idle units and the length is exactly the second bound.
- If tasks are left over, widen the rows and keep dealing. Wider rows only push copies of a label further apart, so the cooldown still holds, nothing idles, and the length is exactly `len(tasks)`.

So the answer is `max(len(tasks), (top - 1) * (n + 1) + ties)`.

The heap simulation reaches the same number the slow way. Each unit, it runs the available label with the most copies left (a max-heap) and parks that label in a queue until its cooldown ends. It's a fine first answer, and the right tool when you have to output the schedule itself.

## Complexity

`O(T)` time to count the labels. The formula itself is `O(26)`. `O(1)` extra space: at most 26 counters.

The heap simulation costs `O(log 26)` per unit it simulates, which is `O(T)` plus the idle units, unless it jumps straight to the next cooldown expiry.

## Pitfalls

- Forgetting the `max` with `len(tasks)`. When there are enough different labels, nothing idles and the frame count alone comes out too small. `["A","A","B","B","C","C","D","D","E","E"]` with `n = 1` needs 10 units, not 4.
- Adding `1` for the final stretch instead of `ties`. Every label tied at the top needs a slot after the last full frame.
- Frames `n` wide instead of `n + 1`. A frame includes the task itself.
