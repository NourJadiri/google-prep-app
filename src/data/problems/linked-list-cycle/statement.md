# Linked List Cycle

## The task

Given the `head` of a singly linked list, return `True` if following `next` pointers ever brings you back to a node you've already visited, and `False` if the walk ends at `None`.

The examples describe a list as its values plus `pos`: the index of the node the tail's `next` points back to, or `-1` when the tail points to `None`. Your function receives only `head` — `pos` is how the test builds the list, not an argument.

## Examples

**Example 1**

```
values = [5,8,2,9], pos = 1   -> true
```

The tail (`9`) links back to the node holding `8`, so the walk loops forever: `5 → 8 → 2 → 9 → 8 → …`

**Example 2**

```
values = [6,6], pos = 0   -> true
```

**Example 3**

```
values = [1,2,3], pos = -1   -> false
```

## Constraints

- `0 <= number of nodes <= 10^4`
- `-10^5 <= Node.val <= 10^5`
- `pos` is `-1` or a valid index.

## Aim for

A set of visited nodes works in `O(n)` space. The classic answer uses `O(1)`: two pointers, one moving one step and one moving two. If there's a loop, the fast one laps the slow one; if not, the fast one hits `None`.

## Follow-ups

- Return the node where the cycle begins.
- How long is the cycle?
