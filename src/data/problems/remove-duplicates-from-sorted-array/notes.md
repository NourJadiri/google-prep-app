## Approach

**The pattern: a read pointer and a write pointer, helped by sorted order.** As in Move Zeroes, one index (`read`) looks at every element and another (`write`) marks where the next keeper goes. The only question is what makes an element worth keeping, and sorting makes that question cheap: in a sorted list, all copies of a value sit side by side. So a value is new exactly when it differs from the last value you kept.

- `nums[0]` is always kept, so start with `write = 1`.
- For each `read` from `1` onward: if `nums[read] != nums[write - 1]` (the last value kept), copy it into `nums[write]` and add one to `write`.
- At the end, `write` is how many values were kept, which is exactly `k`.

Tracing `[2,2,5,9,9,9]`:

```
read 1: 2, same as last kept, skip                  write 1
read 2: 5 is new, copy to slot 1   [2,5,5,9,9,9]   write 2
read 3: 9 is new, copy to slot 2   [2,5,9,9,9,9]   write 3
read 4: 9, same as last kept, skip
read 5: 9, same as last kept, skip                  return 3
```

**Why it works.** Before each step, `nums[:write]` holds each distinct value from `nums[:read]` exactly once, in order. If `nums[read]` equals the last kept value, it's a copy of something already in the front block. If it's different, sortedness guarantees it's bigger than everything kept so far, so it's brand new and belongs at the end of the block. Overwriting is safe because `write <= read` always: you only write over slots the reader has already passed.

**Spotting it next time.** "Sorted" plus "duplicates" means equal values are neighbours, so comparing with one nearby value replaces a hash set. "In place" plus "return the new length" means a reader and a writer. The same idea, comparing with `nums[write - 2]` instead, keeps at most two copies of each value.

## Complexity

`O(n)` time: one pass, constant work per element. `O(1)` extra space.

## Pitfalls

- Returning the index of the last kept value instead of the count. `k` is a length, so it's one more than that index.
- Building a new list and rebinding the name: `nums = sorted(set(nums))` leaves the caller's list untouched, so `nums[:k]` still holds the old values. (`nums[:] = ...` writes into the list, but uses `O(n)` extra space.)
- Starting `write` at `0` and comparing with `nums[write - 1]`. That reads `nums[-1]`, the *last* element, and Python's negative indexing hides the mistake instead of crashing. It only shows up when every value is the same, as in `[7,7,7,7]`, where the very first value already looks like a repeat.
