# Implement Queue using Stacks

## The task

Build a first-in, first-out queue using nothing but stacks. Implement `class MyQueue`:

- `MyQueue()` creates an empty queue.
- `push(x)` adds `x` to the back of the queue.
- `pop()` removes the item at the front of the queue and returns it.
- `peek()` returns the item at the front without removing it.
- `empty()` returns `True` if the queue holds no items, and `False` otherwise.

Inside the class, keep items only in stacks, and only do what a stack allows: push onto the top, look at or remove the top item, and check the size or whether it's empty. In Python, a list that you only touch with `append`, `pop()`, `[-1]` and `len` counts as a stack. The tests can't see how you store things, so this rule is on your honour, but following it is the whole point of the exercise.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output has one entry per operation, with `null` for the constructor and for `push`.

## Examples

**Example 1**

```
ops  = ["MyQueue","push","push","push","pop","push","peek","pop","pop","empty"]
args = [[],[7],[3],[5],[],[8],[],[],[],[]]
                                          -> [null,null,null,null,7,null,3,3,5,false]
```

After three pushes the queue is `7, 3, 5` from front to back, so `pop` returns `7`. Then `8` joins the back, giving `3, 5, 8`. `peek` shows `3`, the next two pops return `3` and `5`, and `8` is still waiting, so `empty` is `false`.

**Example 2**

```
ops  = ["MyQueue","empty","push","pop","empty","push","push","peek"]
args = [[],[],[4],[],[],[6],[9],[]]
                                          -> [null,true,null,4,true,null,null,6]
```

A new queue is empty. Popping its only item makes it empty again, and it keeps working when you fill it back up.

## Constraints

- `1 <= x <= 10^9`
- At most `10^5` calls to `push`, `pop`, `peek` and `empty` in total.
- `pop` and `peek` are only called when the queue isn't empty.

## Aim for

Use two stacks: one that takes every push, and one that `pop` and `peek` are served from. Moving items from one stack to the other reverses their order, and here reversed is exactly what you want. The real question is *when* to move them. Get that right and every operation is amortised `O(1)`. A single call may be slow, but the total work over all the calls grows only in proportion to the number of calls.

## Follow-ups

- Why is it amortised `O(1)` rather than worst-case `O(1)`? Describe a sequence of calls where one `pop` is expensive.
- Now turn it around: build a stack using only queues.
- What goes wrong if several threads push and pop at the same time?
