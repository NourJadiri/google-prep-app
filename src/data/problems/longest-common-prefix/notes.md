## Approach

**The pattern: vertical scanning.** Write the strings one above the other and read down the columns:

```
i n t e r v i e w
i n t e r n e t
i n t e r v a l
          ^
```

Columns 0 to 4 agree (`i`, `n`, `t`, `e`, `r`). Column 5 holds `v`, `n` and `v` — a disagreement — so the common prefix is the first five letters, `"inter"`.

In code, let the first string be the guide. For each position `i` and its letter `ch` in `strs[0]`, look at every other string `s`. If `s` has run out of letters (`i == len(s)`) or has a different letter there (`s[i] != ch`), the common prefix ends just before column `i`, so return `strs[0][:i]`. If every column of the first string survives, the whole first string is the answer.

Why is it correct? A prefix of length `i` is shared by everyone exactly when all the columns before `i` agree. The scan stops at the first column that doesn't, which is the earliest place the shared prefix can end — so what it returns is the longest prefix everyone shares.

The length check matters as much as the letter check: a string that ends ends the prefix too. Test it first, because `s[i]` past the end of `s` raises an `IndexError`.

**Another way: horizontal scanning.** Start with `prefix = strs[0]`. For each next string, chop letters off the end of `prefix` *while* that string doesn't start with it. When you've been through the list, what's left is shared by everyone. It's simple, and fine for these sizes.

**Spotting it next time:** when you compare many sequences position by position, think in columns and stop at the first column that breaks. And if you'll answer many prefix questions about one big set of words, that's the cue for a trie, a tree that stores words letter by letter so shared prefixes share a path.

## Complexity

`O(S)` time, where `S` is the total number of characters: each character is compared at most once. In practice it's often far less, because the scan stops at the first column that breaks. `O(1)` extra space, apart from the string you return.

## Pitfalls

- Indexing past the end of a shorter string. On `["ab","a"]`, column 1 doesn't exist in `"a"` — check `i == len(s)` before `s[i]`.
- Comparing only the first and last strings. That shortcut needs the list *sorted*: then every string in between shares whatever prefix the first and last share. Unsorted, a string in the middle can end the prefix earlier: `["abcd","abxd","abcf"]` shares only `"ab"`.
- Shrinking the prefix with `if` instead of `while` in horizontal scanning. One chop per string isn't always enough.
