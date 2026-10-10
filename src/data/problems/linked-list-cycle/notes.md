## Approach

Floyd's tortoise and hare. Start two pointers at the head; each round, `slow` moves one node and `fast` moves two. Without a loop, `fast` reaches `None` and the answer is `False`. With a loop, both pointers end up circling it, and since `fast` gains one node per round on `slow`, it must land on exactly the same node eventually — compare nodes with `is`, never values.

## Complexity

`O(n)` time: once `slow` enters the loop, `fast` catches it within one lap. `O(1)` extra space.

## Pitfalls

- Comparing `val`s: two different nodes can hold the same value.
- Checking `fast.next.next` without checking `fast.next` first.
