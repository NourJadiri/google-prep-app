## Approach

There are two steps: count, then select.

**Count.** One pass with a hash map from value to number of appearances (`Counter(nums)`). This `O(n)` pass is unavoidable, because you can't know a value's frequency without seeing every element.

**Select.** Now you have `d` distinct values with their counts, and you want the `k` with the largest counts. Here are three ways, in the order you'd present them:

1. Sort the distinct values by count, descending, and take the first `k`. That's `O(d log d)`.
2. Keep a min-heap of at most `k` `(count, value)` pairs. Push each value, and whenever the heap grows past `k`, pop the smallest. Whatever survives is the top `k`, in `O(d log k)`. `heapq.nlargest(k, count, key=count.get)` does exactly this.
3. Bucket sort by frequency, in `O(n)`. The key observation is that a frequency is a small integer between `1` and `n`, so it can serve as an *array index*. Build `buckets[f]` = the values that appear exactly `f` times. Then walk `f` from `n` down to `1`, collecting values until you have `k`.

The walk visits values in non-increasing order of frequency, so the first `k` it collects have the highest frequencies. Because the answer is guaranteed unique, the walk never has to choose between values tied at the cut-off.

## Complexity

Bucket sort: `O(n)` time. Counting is `O(n)`, building `n + 1` buckets and filing `d <= n` values is `O(n)`, and the walk touches each bucket and each value at most once. Extra space is `O(n)` for the counter and the buckets.

Heap: `O(n + d log k)` time and `O(d + k)` space. When `k` is tiny compared with `n`, this is just as fast in practice, and it's the version that carries over to streaming data.

## Pitfalls

- Sizing the bucket array as `n` instead of `n + 1`. When every element is equal, the single value has frequency `n` and falls off the end.
- Walking the buckets from low to high, or popping a min-heap all the way down. Either way you collect the *least* frequent values.
- Returning the `(value, count)` pairs from `most_common`, or ranking values by the value itself instead of its count.
- Calling `nums.count(v)` for every distinct `v`. That's `O(n · d)`, which is quadratic when most values are distinct, and it times out on the large tests.
