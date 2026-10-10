## Approach

**Prefix sums turn subarrays into pairs.** Let `prefix[t]` be the sum of the first `t` numbers, with `prefix[0] = 0`. Then `nums[i..j]` sums to `prefix[j+1] - prefix[i]`, and "a subarray summing to `k`" becomes "an earlier prefix and a later prefix that differ by exactly `k`".

**Count the pairs in one sweep.** Walk the list keeping the running prefix and a hash map `seen` from each prefix value to how many times it has occurred so far. At each position the running prefix is the *later* end of a pair, and the number of valid earlier ends is `seen[prefix - k]`. Add that to the answer, then record the current prefix.

Two details carry the whole solution:

- **Seed the map with `{0: 1}`.** The empty prefix, before any number, is a legitimate earlier end — it's what lets a subarray starting at index `0` count. Without it, `[3,4,7]` with `k = 7` finds `[7]` but misses `[3,4]`.
- **Look up before you store.** Store the current prefix first and, when `k = 0`, it pairs with itself — an empty subarray — at every step.

It's the Two Sum ledger again: not "have I seen the complement value?" but "how many times have I seen the complement prefix?"

**Why not a sliding window?** A window works only when growing it can only raise the sum and shrinking it can only lower it — that is, when every number is positive. With negatives or zeros, a window that overshoots `k` may come back down later, so shrinking it throws away subarrays that would have matched.

## Complexity

`O(n)` time: one pass with `O(1)` average hash map work per number. `O(n)` space: up to `n + 1` distinct prefix values.

## Pitfalls

- Forgetting the `{0: 1}` seed: every subarray that starts at index `0` goes uncounted.
- Recording the current prefix before looking up `prefix - k`: with `k = 0`, every position counts an empty subarray.
- Reaching for a sliding window, which silently assumes the numbers are positive.
