# Reverse Linked List

## The task

You get the `head` of a singly linked list. Reverse the list — every `next` pointer turned to face the other way — and return the new head.

The list is given and shown as an array of node values, front to back. An empty list is `[]`, and its head is `None`.

## Examples

**Example 1**

```
head = [3,1,4,1,5]   -> [5,1,4,1,3]
```

**Example 2**

```
head = [8,2]   -> [2,8]
```

**Example 3**

```
head = []   -> []
```

Nothing to reverse: return `None`.

## Constraints

- `0 <= number of nodes <= 5000`
- `-5000 <= Node.val <= 5000`

## Aim for

`O(n)` time and `O(1)` extra space with three pointers — `prev`, `cur`, and the `nxt` you save *before* you overwrite `cur.next`. Then do it again recursively and say what the call stack costs.

## Follow-ups

- Reverse only positions `left..right` of the list.
- Reverse in groups of `k`. What happens to a short final group?
