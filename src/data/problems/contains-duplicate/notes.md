## Approach

**The pattern: a hash set as your memory.** The direct way to find a repeat is to compare every number with every other number. That's correct, but with `n` numbers it's about `n^2 / 2` comparisons — five billion when `n` is `10^5`.

The fix is to stop re-reading the list. Walk it once and keep every value you've passed in a **set**. At each new number, ask the set one question: *have I seen this before?* If yes, that's a duplicate — return `True` right away. If no, add the number and keep walking. Reaching the end without a single yes means every value was different, so return `False`.

Why is that fast? A Python `set` is a **hash set**. It turns each value into a number called its *hash*, which says where in memory the value belongs, so `x in seen` jumps straight to the right spot instead of looking through everything. That makes each check `O(1)` on average, however big the set grows. A list can't do this: `x in some_list` checks the items one by one.

Why is it correct? When the loop reaches a number, `seen` holds exactly the numbers that came before it. So the loop says `True` precisely when some number has an equal number earlier in the list — which is what "contains a duplicate" means.

You'll also see the one-liner `len(set(nums)) < len(nums)`: building a set squeezes out repeats, so the set is smaller than the list only if there were some. It's worth mentioning, but it always builds the whole set, while the loop stops at the first repeat.

**The other classic: sort first.** After sorting, equal values sit next to each other, so one pass comparing each number with its neighbour finds any duplicate. That costs `O(n log n)` time but needs no set — useful when memory is tight, as long as you're allowed to reorder the input.

**Spotting it next time:** whenever a problem boils down to "have I seen this before?" — repeats, the first repeated item, "are all of these unique?", cells already visited — reach for a set. If you also need to know *where* you saw something or *how many times*, upgrade the set to a dictionary — Two Sum is the classic example of that upgrade.

## Complexity

With a set: `O(n)` time — one pass, and each `in` and `add` is `O(1)` on average. `O(n)` extra space, because with no duplicates every number ends up in the set.

With sorting: `O(n log n)` time. Sorting in place with `nums.sort()` is usually counted as `O(1)` extra space in interviews (strictly, Python's sort may borrow up to `O(n)` scratch memory); `sorted(nums)` makes an `O(n)` copy.

## Pitfalls

- Checking only neighbours without sorting first. In `[3,8,1,8,5]` the two `8`s aren't next to each other, so a neighbour check misses them.
- Using a list for `seen`. The code looks almost the same, but every `in` becomes a scan and the whole thing is back to `O(n^2)`.
- An off-by-one in the sorted version: the last pair to compare is `nums[n - 2]` with `nums[n - 1]`. Stop one step early and a repeat of the largest value, as in `[1,5,3,9,2,9]`, goes unnoticed.
