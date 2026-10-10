# Most Common Word

## The task

You're given a piece of text, `paragraph`, and a list of `banned` words. Return the word that appears **most often** in the paragraph without being banned, written in lowercase.

What counts as a word:

- A word is a run of consecutive letters (`a` to `z`, `A` to `Z`). Every other character — a space, or one of the punctuation marks `!?',;.` — ends the current word, even with no space after it.
- That includes the apostrophe: `can't` is the two words `can` and `t`.
- Case doesn't matter: `Ball`, `ball` and `BALL` are the same word. The banned words are always lowercase and match regardless of case.

The tests guarantee that at least one word isn't banned and that exactly one non-banned word has the highest count, so there's never a tie.

## Examples

**Example 1**

```
paragraph = "Tea? Tea! Coffee, tea, and more COFFEE. No, just tea.", banned = ["tea"]   -> "coffee"
```

`tea` appears four times but is banned. `coffee` appears twice (once as `COFFEE`), and every other word appears once.

**Example 2**

```
paragraph = "red,blue;red.Green!green? red", banned = []   -> "red"
```

Punctuation ends a word even without a space after it. The words are `red`, `blue`, `red`, `green`, `green` and `red`.

**Example 3**

```
paragraph = "We can't. We won't. We shan't!", banned = ["we"]   -> "t"
```

The apostrophes split `can't`, `won't` and `shan't`, so `t` appears three times — more than `can`, `won` or `shan`, which appear once each.

## Constraints

- `1 <= paragraph.length <= 1000`
- `paragraph` contains only English letters, spaces and the symbols `!?',;.`
- `0 <= banned.length <= 100`
- `1 <= banned[i].length <= 10`, and `banned[i]` contains only lowercase English letters.
- At least one word isn't banned, and the most frequent non-banned word is unique.

## Aim for

Break the job into three small steps and say them out loud before coding: **clean** the text so every word looks the same however it was written, **split** it into words, and **count** the words that aren't banned. A dictionary does the counting; putting the banned words in a set makes each "is this banned?" check `O(1)`. The whole thing is linear: `O(P + B)` time, where `P` is the paragraph's length and `B` the total length of the banned words.

## Follow-ups

- Return the `k` most common non-banned words, most frequent first.
- The text is a 50 GB log file instead of one paragraph. What changes?
