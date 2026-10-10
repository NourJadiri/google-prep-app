## Approach

**The pattern: normalise, split, count.** Text problems get much easier when you first turn the messy input into a clean, uniform shape, and only then apply the obvious algorithm.

1. **Normalise.** Make one pass over the paragraph: lowercase every letter and replace every other character with a space. `"red,blue;red.Green"` becomes `"red blue red green"`, and `"can't"` becomes `"can t"`. Collect the characters and glue them with `"".join(...)` — that keeps the pass `O(n)`.
2. **Split.** Now `str.split()` with no argument does exactly the right thing: it splits on any run of spaces and never returns empty pieces. What comes back is the list of words.
3. **Count.** Count every word that isn't banned with a dictionary, or with `collections.Counter`, and return the word with the highest count. `Counter.most_common(1)` hands you that directly.

Put `banned` into a **set** before counting. Checking `w not in banned_set` is `O(1)`, while checking a list compares against every banned word each time.

Why normalise first? Because afterwards every word looks the same however it was written — `"Ball"`, `"BALL,"` and `"ball!"` all become `ball` — so the counting step never has to think about punctuation or case. Each step does one job, and each is easy to check on its own. The same three steps also work with a regular expression: `re.findall(r"[a-z]+", paragraph.lower())` lowercases, then picks out every run of letters in one go.

**Spotting it next time:** "most frequent", "top `k`", "count the words" all call for a counting dictionary. And whenever the input is human-written text with punctuation and mixed case, normalise before you count. In an interview, naming the three steps before writing any code is a big part of the answer.

## Complexity

`O(P + B)` time: one pass to clean the paragraph of length `P`, one pass over its words, and `O(B)` to build the banned set from `B` total characters. `O(P + B)` space for the cleaned text, the counts and the set.

## Pitfalls

- Splitting on spaces only. `"red,blue"` stays one piece, and stripping punctuation from the ends of a piece can't split it in two.
- Forgetting the apostrophe. It separates words too, so `can't` counts as `can` and `t`.
- Removing banned words with `str.replace`. Banning `he` would also chop up `the`. Compare whole words instead.
- Splitting with `re.split(r"\W+", ...)`. It leaves an empty string at each end when the paragraph starts or ends with punctuation, and in `"!?Yes!?"` the empty string shows up twice — more often than `yes`.
