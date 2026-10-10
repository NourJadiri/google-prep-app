## Approach

**The pattern: merging with two pointers.** You may have done this by hand. You have two piles of exam papers, each sorted by name, and you want one sorted pile. Look at the top paper of each pile, take whichever comes first, and repeat. You never need to look further down than the two tops. Each pile is sorted, so the smallest paper left anywhere has to be on top of one of them.

With linked lists, taking a node means linking it onto the end of the result. You need three pointers:

- `list1` and `list2` point to the front of whatever is left of each list.
- `tail` points to the last node of the result so far.

Each round, compare `list1.val` with `list2.val`. Link the smaller node after `tail`, move that list's pointer forward one node, and move `tail` onto the node you just linked.

When one list runs out, stop. The other list's remaining nodes are already sorted, and each one is at least as big as everything in the result. So attach the whole rest in one step, `tail.next = list1 or list2`, with no loop.

**The dummy node trick.** Which node is the head of the result? That depends on which list starts with the smaller value, and if you work it out with an `if`, you'll also need special cases for empty lists. Instead, make a throwaway node called `dummy` and start with `tail = dummy`. Now every real node gets linked after something, even the first one. At the end, the real head is `dummy.next`. If both lists were empty, that's `None`, which is also the right answer.

Here's a trace of Example 1, `[2,5,9]` and `[1,5,6,12]`. Take `1` from `list2`, then `2`. Next is `5` against `5`, a tie, so either works. Take `list1`'s first, then the other `5`, then `6` and `9`. Now `list1` is empty, so attach the rest of `list2`, which is `[12]`. The result is `[1,2,5,5,6,9,12]`.

**Spotting it next time.** When two sorted sequences need combining, comparing or intersecting, walk them together with one pointer each, and always move forward the one that's behind. This merge step is the heart of merge sort. The dummy node is worth reaching for whenever you build a new linked list and the head would otherwise need special handling.

## Complexity

`O(n + m)` time: every round links one node, and attaching the leftovers is a single step. `O(1)` extra space: just a few pointers and the dummy node, because the result reuses the original nodes.

There's also a neat recursive version: the smaller front node becomes the head, and its `next` is the merge of everything else. But it uses one stack frame per node, so it needs `O(n + m)` space.

## Pitfalls

- Forgetting the leftovers. The loop stops as soon as one list is empty. Without `tail.next = list1 or list2`, the rest of the other list is lost.
- Forgetting to move `tail` forward. Each newly linked node has to become the new tail, or you'll keep overwriting the same link.
- Moving both pointers on a tie. Only the list you took a node from should move forward. The other list's front node still needs to be placed.
