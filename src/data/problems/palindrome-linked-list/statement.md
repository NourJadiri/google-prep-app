# Palindrome Linked List

## The task

You get the `head` of a non-empty singly linked list whose values are digits. Return `True` if the values read the same from back to front as they do from front to back, and `False` otherwise.

You may rearrange the nodes while you work, since only your answer is checked. (Putting the list back afterwards is good manners, though. See the follow-ups.)

The list is given and shown as an array of node values, front to back.

## Examples

**Example 1**

```
head = [3,1,4,1,3]   -> true
```

Backwards it's still `3, 1, 4, 1, 3`. When the length is odd, the middle value doesn't need a partner.

**Example 2**

```
head = [6,2,6,2]   -> false
```

Backwards it reads `2, 6, 2, 6`. Every value appears an even number of times, but that isn't enough. The first value has to match the last, the second has to match the second-to-last, and so on.

**Example 3**

```
head = [9]   -> true
```

A single node reads the same both ways.

## Constraints

- `1 <= number of nodes <= 10^4`
- `0 <= Node.val <= 9`

## Aim for

A fine first answer is to copy the values into a Python list and compare it with its reverse. That's `O(n)` time and `O(n)` space. To get down to `O(1)` extra space, combine two techniques you may have met already. Find the middle with fast and slow pointers, reverse the second half in place, then walk in from both ends and compare values.

## Follow-ups

- Put the list back the way you found it before you return. Why might the caller care?
- Solve it with recursion instead. How much stack space does that use?
- What changes if the list is doubly linked?
