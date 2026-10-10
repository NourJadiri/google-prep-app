# Task Scheduler

## The task

A single worker must get through a list of `tasks`, each labelled with an uppercase letter. Time is divided into units, and in each unit the worker either completes exactly one task or sits idle. Tasks may be done in any order.

The cooldown rule: if a task with some label is done at time `t`, the next task with the **same** label can't be done before time `t + n + 1`. So at least `n` units separate two tasks with the same label, and the worker can fill those units with other labels or with idle time.

Return the smallest number of time units, idle ones included, needed to finish every task.

## Examples

**Example 1**

```
tasks = ["X","X","X","Y","Y","Z"], n = 2   -> 7
```

One best schedule is `X Y Z X Y idle X`. The three `X`s need two units between each pair, and there aren't enough other tasks to fill both gaps.

**Example 2**

```
tasks = ["A","A","B","B"], n = 3   -> 6
```

`A B idle idle A B`. Both labels have two copies, so the final stretch after the last gap has to hold one of each.

**Example 3**

```
tasks = ["P","Q","P","Q","R","S"], n = 1   -> 6
```

`P Q P Q R S` never idles, so the answer is just the number of tasks.

## Constraints

- `1 <= tasks.length <= 10^4`
- Each `tasks[i]` is a single uppercase English letter.
- `0 <= n <= 100`

## Aim for

`O(T)` time and `O(1)` extra space (one counter per letter), where `T` is the number of tasks. A simulation with a max-heap of remaining counts and a cooldown queue works and is worth sketching. The interview answer doesn't simulate, though. Reason about the most frequent label: its copies force a skeleton of frames `n + 1` slots wide. Count the frames, see what fills their gaps, and decide whether any idle time is left over.

## Follow-ups

- Return an actual optimal schedule, not just its length.
- The tasks must now be done in exactly the given order, with only the cooldown enforced. How long does that take?
- Each label has its own cooldown. Does the frame argument survive?
