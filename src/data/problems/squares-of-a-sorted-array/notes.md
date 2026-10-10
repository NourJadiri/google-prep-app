## Approach

Start with the honest first answer: square everything, then sort. That's `O(n log n)`, and saying it out loud is worth points. To beat it, use the order the input already has.

**The pattern: two pointers closing in from both ends.** In some sorted-list problems, the interesting values sit at the *edges*: the biggest, the smallest, the most extreme. Put one pointer at each end, decide which end to take from, and move that pointer inward. Each step settles one element for good.

Why are the edges interesting here? A square only cares about how far a number is from zero. In a sorted list, the negatives get closer to zero as you move right, and the positives get further away. So the squares go *down* across the negatives and back *up* across the positives, like a valley. The smallest square is somewhere in the middle, which is hard to find. The largest square is easy: it's at one of the two ends.

So fill the answer from the back. Compare `abs(nums[lo])` with `abs(nums[hi])`, write the square of the bigger one into the last empty slot, and move that pointer inward. Tracing `[-6,-2,1,3,5]`:

```
-6 vs 5: 36 goes last    [_,_,_,_,36]
-2 vs 5: 25              [_,_,_,25,36]
-2 vs 3: 9               [_,_,9,25,36]
-2 vs 1: 4               [_,4,9,25,36]
 1 alone: 1              [1,4,9,25,36]
```

**Why it works.** The values not yet placed always form one unbroken stretch, `nums[lo..hi]`, which is still sorted, so its biggest square is at one of its two ends. Each step takes that biggest square and writes it just in front of everything already placed, all of which is at least as big. The answer fills in order from the back, and every element is placed exactly once.

**Spotting it next time.** A sorted input, an operation that folds the order around a point (squares, absolute values, distance from a target), and a sorted output: two pointers at the ends, filling from the back. It's really Merge Sorted Array in disguise. The negatives, read backwards, form one sorted list of squares, and the non-negatives form another.

## Complexity

`O(n)` time: each step places one square. `O(1)` extra space besides the output list.

## Pitfalls

- Comparing `nums[lo] > nums[hi]` instead of their absolute values. A negative number is "small", but its square can be the largest of all.
- Filling from the front. The smallest square is in the middle, not at an end, so comparing the two ends can't tell you what goes first.
- Looping `while lo < hi` and losing the last element. When `lo == hi`, one element is still waiting to be placed.
