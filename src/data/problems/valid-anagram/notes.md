## Approach

**The pattern: count, then compare counts.** Two strings are anagrams exactly when every letter appears the same number of times in both. Order plays no part, so throw the order away and keep only the counts: if the counts match, the strings are anagrams; if any count differs, they aren't.

The reference does it with one dictionary and two passes:

1. If the lengths differ, return `False` straight away.
2. Walk `s` and count each letter: `count[ch] = count.get(ch, 0) + 1`.
3. Walk `t` and *spend* those counts. If `t` needs a letter whose count is already `0`, then `t` has more of that letter than `s` does: return `False`. Otherwise subtract one.
4. If `t` gets all the way through, return `True`.

Why doesn't step 4 need to check that every count is back to zero? Because of step 1. `t` spent exactly `len(s)` letters and never took more of any letter than `s` had. `s` only had `len(s)` letters in total, so nothing can be left over.

In everyday Python you'd write `Counter(s) == Counter(t)`. `collections.Counter` is a dictionary that does the counting for you, and two Counters are equal when every count matches. It's a fine interview answer once you've shown you know what it does underneath.

**The other classic: sort both.** `sorted(s) == sorted(t)` puts each string's letters into a fixed order, so two anagrams become the same list. It's shorter to write, but sorting costs `O(n log n)` instead of `O(n)`.

**Spotting it next time:** "same letters in any order", "rearrange", "is this a permutation of that", "can you build X out of the letters of Y" are all asking you to compare counts. A dictionary of counts, or a `Counter`, is the tool. In Two Sum a dictionary remembers *where* each value was seen; here it remembers *how many times*.

## Complexity

Counting: `O(n)` time for strings of length `n`, since each letter is handled a constant number of times. The extra space is `O(1)`, because the dictionary never holds more than 26 keys however long the strings are. With an unlimited alphabet it would be `O(k)` for `k` different characters.

Sorting: `O(n log n)` time and `O(n)` space for the sorted copies.

## Pitfalls

- Comparing sets of letters: `set("aab") == set("abb")` is `True`, but the counts differ. Checking the lengths as well doesn't fix it — `"aab"` and `"abb"` have the same length.
- Checking in one direction only. "Every letter of `s` appears in `t`" accepts `"tea"` and `"seat"`.
- Leaving out the length check in the spend-the-counts version: with `s = "abcd"` and `t = "abc"`, `t` never overspends, yet they aren't anagrams.
