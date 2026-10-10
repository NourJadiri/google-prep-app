# Find Median from Data Stream

## The task

Integers arrive one at a time, and at any moment you may be asked for the median of everything received so far. The median of a sorted list is its middle element when the length is odd, and the mean of its two middle elements when the length is even. So `[1,4,9]` has median `4.0`, and `[1,4,9,10]` has median `6.5`.

Implement `class MedianFinder`:

- `MedianFinder()` starts with no numbers.
- `addNum(num)` records the integer `num`.
- `findMedian()` returns the median of all numbers recorded so far, as a float.

Answers within `10^-5` of the true median are accepted.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation, with `null` for the constructor and for `addNum`.

## Examples

**Example 1**

```
ops  = ["MedianFinder","addNum","findMedian","addNum","findMedian","addNum","findMedian"]
args = [[],[6],[],[10],[],[2],[]]
                                        -> [null,null,6.0,null,8.0,null,6.0]
```

After `6`, the median is `6.0`. After `6, 10`, it's the mean `8.0`. After `2, 6, 10`, it's the middle value `6.0`.

**Example 2**

```
ops  = ["MedianFinder","addNum","addNum","findMedian","addNum","addNum","findMedian"]
args = [[],[-3],[-8],[],[4],[1],[]]
                                        -> [null,null,null,-5.5,null,null,-1.0]
```

The mean of `-8` and `-3` is `-5.5`, not rounded down. With `-8, -3, 1, 4` recorded, the two middle values are `-3` and `1`.

**Example 3**

```
ops  = ["MedianFinder","addNum","findMedian","findMedian"]
args = [[],[-100000],[],[]]
                                        -> [null,null,-100000.0,-100000.0]
```

A single number is its own median, and asking twice changes nothing.

## Constraints

- `-10^5 <= num <= 10^5`
- `findMedian` is only called after at least one `addNum`.
- At most `5 * 10^4` calls to `addNum` and `findMedian` in total.

## Aim for

Re-sorting on every query costs `O(n log n)` per call, and inserting into a sorted list costs `O(n)` per call. Name both, then beat them. The classic answer keeps two heaps: a max-heap with the smaller half of the numbers and a min-heap with the larger half, with sizes equal or the max-heap one bigger. `addNum` is `O(log n)`, and `findMedian` is `O(1)` because it only reads the two tops. Python's `heapq` is a min-heap, so store the smaller half negated.

## Follow-ups

- Every number is in `[0, 100]`. Can you do better? What if only 99% of them are?
- Report the median of just the last `k` numbers (a sliding window). What does deleting from a heap cost, and how do you avoid paying it?
- Return an arbitrary percentile, say the 90th, instead of the median.
