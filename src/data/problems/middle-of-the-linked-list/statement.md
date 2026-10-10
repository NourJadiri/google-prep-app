# Middle of the Linked List

## The task

You get the `head` of a non-empty singly linked list. Return its middle node.

If the list has an odd number of nodes, there's exactly one middle. If it has an even number, there are two nodes in the middle, and you should return the **second** one. Counting positions from 0, that's the node at position `n // 2` in a list of `n` nodes.

Lists are given as arrays of node values, front to back. You return a node, not a value, and the tests show your answer as the list that starts at that node and runs to the end. So returning the node holding `8` in `[7,1,8,2,9]` shows up as `[8,2,9]`.

## Examples

**Example 1**

```
head = [7,1,8,2,9]   -> [8,2,9]
```

Five nodes: two before `8`, two after it.

**Example 2**

```
head = [4,3,2,1]   -> [2,1]
```

Four nodes, so both `3` and `2` sit in the middle. Return the second of the two, the node holding `2`.

**Example 3**

```
head = [6]   -> [6]
```

A single node is its own middle.

## Constraints

- `1 <= number of nodes <= 100`
- `1 <= Node.val <= 100`

## Aim for

The easy way is two passes: count the nodes, then walk halfway. Can you do it in one pass? Send two pointers from the head at the same time, with one moving twice as fast as the other. Where is the slow one when the fast one reaches the end? Then check which middle you land on for even lengths, and adjust the loop's condition if you need to. That's `O(n)` time and `O(1)` extra space.

## Follow-ups

- Return the first of the two middle nodes instead. What changes?
- Delete the middle node from the list.
- Find the node `k` positions from the end in a single pass.
