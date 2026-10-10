## Approach

**First answer: count with a dictionary.** Walk the list, keep `count[x]` for every value, and return the value whose count is more than `n / 2`. You can even return the moment a count goes past half. It's `O(n)` time and hard to get wrong — say it first. Its only cost is memory: the dictionary can hold close to `n / 2` different values.

**Better: the Boyer–Moore majority vote.** This finds the majority with just two variables, `candidate` and `count`.

Picture every number as a voter, and keep pairing up two voters who disagree and sending both home. Each such pair contains at most one majority voter, and at least one other voter. The majority started with more voters than everyone else combined, so the others run out first. When no disagreeing pair is left, everyone still standing votes the same way — and it has to be for the majority.

The algorithm does this pairing in one pass. `count` is the number of supporters of `candidate` who haven't been paired off yet:

- If `count` is `0`, nobody is waiting, so the current number becomes the new `candidate`.
- If the current number equals `candidate`, `count += 1`: one more unpaired supporter.
- Otherwise `count -= 1`: this number pairs off with one supporter, and both go home.

Here it is on `[9,9,5,5,5,5,9]`:

```
x          9  9  5  5  5  5  9
candidate  9  9  9  9  5  5  5
count      1  2  1  0  1  2  1
```

The two `9`s are cancelled by the first two `5`s. The third `5` finds `count == 0` and takes over, and the last `9` cancels one `5` — but `5` stays the candidate.

The candidate may change many times along the way, and that's fine: only the final one matters. It is guaranteed correct *because* the problem promises a majority exists. Without that promise, the last candidate could be anything, and you'd need a second pass that counts it and checks it really fills more than half.

**Spotting it next time:** "appears more than half the time" is the cue for cancelling pairs. More generally, when an interviewer asks for `O(1)` space where a counting dictionary is the obvious tool, ask whether a tiny bit of running state could stand in for the whole dictionary.

## Complexity

Boyer–Moore: `O(n)` time in one pass, `O(1)` extra space — two variables.

Dictionary: `O(n)` time and `O(n)` space. Sorting also works: the majority covers more than half of the sorted list, so it must cover the middle position `n // 2`. That's `O(n log n)` time.

## Pitfalls

- Starting with `candidate = nums[0]` and `count = 1` and then looping over *all* of `nums`. The first number gets counted twice, and on `[1,2,2]` the answer comes out as `1`.
- Forgetting that "more than half" is strict. Returning as soon as a count reaches `n // 2` picks `4` in `[4,4,4,7,7,7,7]`, because the three `4`s get there before the `7`s do.
- Trusting the candidate when a majority isn't guaranteed. In that version of the problem, always verify it with a second pass.
