## Approach

**Two opposite orders.** A stack is last in, first out: the plate you put down last is the first one you pick up. A queue is first in, first out: whoever joined the line first is served first. These orders are exact opposites, and that's what makes the trick work. Pour one stack into another, one item at a time, and the order flips. The item that was at the bottom, which is the oldest, ends up on top.

So use two stacks:

- `inbox` takes every `push`. Its top is the newest item.
- `outbox` serves `pop` and `peek`. Its top is the oldest item, which is the front of the queue.

One rule makes it all work: **only pour `inbox` into `outbox` when `outbox` is empty.** If `outbox` still has items, they're older than everything in `inbox` and must be served first. Pouring now would bury them under newer items. Once `outbox` is empty, pour everything across, and the oldest item from `inbox` lands on top, ready to serve.

That gives you:

- `push(x)`: append to `inbox`.
- `peek()`: if `outbox` is empty, pour; then return the top of `outbox`.
- `pop()`: the same as `peek`, but remove the top item instead of just looking.
- `empty()`: `True` only when *both* stacks are empty.

Here's a trace of Example 1, writing each stack with its top on the right. Push 7, 3 and 5, and `inbox = [7, 3, 5]`. On `pop`, `outbox` is empty, so pour: `outbox = [5, 3, 7]`, and popping gives `7`. Push 8 makes `inbox = [8]`. On `peek`, `outbox` still has `3` on top, so there's no pour and the answer is `3`. Pop `3`, then pop `5`. Now `outbox` is empty but `inbox` still holds `8`, so `empty()` is `False`.

**Why amortised O(1)?** A single `pop` can be slow. The first one after 50,000 pushes moves 50,000 items. But follow one item through its life: it's pushed onto `inbox` once, moved to `outbox` once, and popped from `outbox` once, and never touched again. So any sequence of `n` calls does at most about `3n` stack operations in total, which works out to `O(1)` per call on average. That's what *amortised* means: a guarantee about the average cost over the whole sequence, even though a single call can be expensive.

**Spotting it next time.** When you need one order but your tool hands you the reverse, a second stack flips it. More generally, look for ways to put off expensive work until you can't avoid it, and make sure each item pays for that work only once. That idea is what amortised analysis is about, and you'll see it again. Python's own lists use it: `append` is amortised `O(1)` because the list only occasionally copies itself into a bigger block of memory.

## Complexity

`push` and `empty` are `O(1)`. `pop` and `peek` are amortised `O(1)`: the one call that pours is `O(n)`, but each item is poured at most once. Space is `O(n)` for the `n` items stored.

## Pitfalls

- Pouring while `outbox` still has items. Newer items end up on top of older ones and jump the queue. Push 1, push 2, pop, push 3, pop has to give `2`, not `3`.
- Pouring everything back from `outbox` to `inbox` after every `pop` to "keep things tidy". The answers are still right, but every `pop` becomes `O(n)`, and the big tests will time out.
- Checking only one stack in `empty()`. Items can be waiting in either one.
