## Approach

**The obvious way first.** Walk the list once to count its `n` nodes, then start again from the head and take `n // 2` steps. That's two passes, `O(n)` time and `O(1)` space. It's a perfectly good answer, and worth saying out loud in an interview before you improve on it.

**The pattern: fast and slow pointers.** Picture two runners on a track, one running exactly twice as fast as the other. When the fast one crosses the finish line, the slow one is exactly halfway. Do the same with two pointers that both start at `head`. Each round, `slow` moves one node and `fast` moves two. When `fast` can't go any further, `slow` is at the middle. You find it in a single pass, without ever knowing `n`.

The one thing to get right is when to stop. Keep going while `fast and fast.next`, which means `fast` is on a real node that has a node after it, so it can make its double step. (The double step may land on `None`, and that's fine.)

Here's how both cases play out:

- 5 nodes, `[7,1,8,2,9]`. Both start at `7`. Round 1: `slow` moves to `1`, `fast` to `8`. Round 2: `slow` moves to `8`, `fast` to `9`. Now `fast.next` is `None`, so stop. `slow` is on `8`, the middle.
- 4 nodes, `[4,3,2,1]`. Both start at `4`. Round 1: `slow` moves to `3`, `fast` to `2`. Round 2: `slow` moves to `2`, and `fast` steps off the end to `None`. Stop. `slow` is on `2`, the second middle, which is exactly what the task asks for.

Why does it always work? After `k` rounds, `slow` has moved `k` nodes and `fast` has moved `2k`. With an odd `n`, the loop stops when `fast` reaches the last node, at position `n - 1`, so `k = (n - 1) / 2`. With an even `n`, it stops when `fast` steps past the end, at position `n`, so `k = n / 2`. Either way `k` is `n // 2`, the position the task asks for.

**Spotting it next time.** Fast and slow pointers answer linked-list questions about position or shape without counting first. They find the middle; they find the node `k` from the end, if you give one pointer a head start of `k`; and they tell you whether a list loops back on itself (Linked List Cycle). When a linked-list question says "one pass" or "`O(1)` space", try two pointers moving at different speeds.

## Complexity

`O(n)` time: `fast` crosses the list once, so there are about `n / 2` rounds. `O(1)` extra space for the two pointers.

## Pitfalls

- Landing on the wrong middle for even lengths. `while fast.next and fast.next.next` stops one round early and returns the first middle, but the task wants the second.
- Checking `fast.next` before checking `fast`. Once `fast` has stepped off the end it's `None`, and `None.next` crashes. Test `fast` first.
- Returning `slow.val` instead of the node itself.
