## Approach

**First, the easy way.** Walk the list and copy each value into a Python list, then check `values == values[::-1]`. That's `O(n)` time and `O(n)` space, and in an interview it's the answer to give first. The follow-up question is almost always: can you do it with `O(1)` extra space?

**Then the space-saving way: three small patterns in a row.** You can only walk a singly linked list forwards, so you can't read it from the back. But you *can* turn the back half around. It takes three steps:

1. **Find the middle** with fast and slow pointers, as in Middle of the Linked List. `slow` moves one node per round and `fast` moves two. When `fast` runs out, `slow` is at the start of the second half.
2. **Reverse the second half** in place, starting from `slow`, as in Reverse Linked List. Walk it with `prev`, `cur` and a saved `nxt`, turning every link around. Afterwards, `prev` is the old last node, and following `next` from there walks the second half backwards.
3. **Compare** with two pointers: `left` starts at `head` and `right` starts at `prev`. Move both forward together. If any pair of values differs, return `False`. If `right` runs out first, every pair matched, so return `True`.

Here's a trace of `[3,1,4,1,3]`. The middle is the `4`. Reversing from there gives `3, 1, 4`, read from the old tail. Then compare `3` with `3`, `1` with `1`, and `4` with itself. Everything matches, so the answer is `True`.

And here's `[6,2,6,2]`. `slow` stops at the second `6`, at position 2, and reversing from there gives `2, 6`. The very first comparison is `6` against `2`. They differ, so the answer is `False`.

Why is it safe to stop when `right` runs out? Only the links in the second half were turned, so the first half still links into the middle node. That means `right` (the second half) never has more nodes to visit than `left` (the path from `head` to the middle). With an odd length, both pointers finish on the middle node, which gets compared with itself.

**Leave things as you found them.** Step 2 changed the caller's list. The tests only check your answer, but in real code it's polite, and an easy interview bonus, to reverse the second half again before returning.

**Spotting it next time.** Many linked-list problems are a chain of the same few moves: find the middle, reverse a section, then merge or compare two lists. Once you can see the separate steps, a "medium" problem turns into three "easy" ones in a row. Reorder List is exactly this.

## Complexity

`O(n)` time: finding the middle, reversing half the list and comparing are each a single pass over at most the whole list. `O(1)` extra space for a handful of pointers. By comparison, copying into a Python list costs `O(n)` space, and the recursive version uses `O(n)` space on the call stack.

## Pitfalls

- Reversing the *whole* list and comparing it with `head`. After an in-place reversal, `head` is the last node and its `next` is `None`, so you'd only compare the first value with the last. Reverse just the second half, or copy the values if you need the original order.
- Losing the rest of the list while reversing. Save `nxt = cur.next` before you turn the link.
- Checking that every value appears an even number of times. `[6,2,6,2]` passes that check but isn't a palindrome. Position matters, not just counts.
