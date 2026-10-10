# Merge Two Sorted Lists

## The task

You get the heads of two singly linked lists, `list1` and `list2`. Each one is already sorted in non-decreasing order, so every value is at least as big as the one before it. Combine them into a single sorted list and return its head.

Build the result by relinking the nodes you were given, rather than creating new ones. Either list may be empty.

Lists are given and shown as arrays of node values, front to back. An empty list is `[]`, and its head is `None`.

## Examples

**Example 1**

```
list1 = [2,5,9], list2 = [1,5,6,12]   -> [1,2,5,5,6,9,12]
```

The two lists take turns supplying the smallest remaining value. Both have a `5`, and both copies stay in the result.

**Example 2**

```
list1 = [], list2 = [-7,3]   -> [-7,3]
```

With one list empty, the answer is simply the other list.

**Example 3**

```
list1 = [10,20,30], list2 = [1,2,3]   -> [1,2,3,10,20,30]
```

Every value in `list2` is smaller, so all of `list2` comes first and `list1` is attached after it, all in one go.

## Constraints

- `0 <= number of nodes in each list <= 50`
- `-100 <= Node.val <= 100`
- Both lists are sorted in non-decreasing order.

## Aim for

Walk down both lists at the same time. At each step, compare the two front nodes, take the smaller one, and move forward in that list only. When one list runs out, what should happen to the rest of the other? A placeholder node at the start of your result saves you from treating the very first node as a special case. That's `O(n + m)` time and `O(1)` extra space.

## Follow-ups

- Write it recursively. How deep does the recursion go, and what does that cost?
- Merge `k` sorted lists instead of two. How do you avoid comparing all `k` fronts at every step?
- The values arrive in two sorted arrays instead, and the first array has room at the end for the second. Merge them in place.
