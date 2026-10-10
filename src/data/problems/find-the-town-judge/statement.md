# Find the Town Judge

## The task

A town has `n` residents, labelled `1` to `n`, and rumour says one of them is secretly the town judge. A resident is the judge exactly when both of these hold:

1. The judge trusts nobody.
2. Every other resident trusts the judge.

You're given `trust`, where `trust[i] = [a, b]` means resident `a` trusts resident `b`. Trust is one-way: `a` trusting `b` says nothing about `b` trusting `a`. Any pair that isn't listed is a pair where no trust exists. Return the judge's label, or `-1` if nobody satisfies both rules. (At most one resident can: two judges would each have to trust the other.)

## Examples

**Example 1**

```
n = 4, trust = [[1,3],[2,3],[4,3],[2,1]]   -> 3
```

Residents 1, 2 and 4 all trust resident 3, and 3 trusts nobody. Resident 2 also trusting resident 1 changes nothing.

**Example 2**

```
n = 3, trust = [[1,2],[3,2],[2,1]]   -> -1
```

Everyone else trusts resident 2, but 2 trusts resident 1, so 2 can't be the judge — and nobody else is trusted by everyone.

**Example 3**

```
n = 1, trust = []   -> 1
```

A town of one: the only resident trusts nobody, and there's nobody else who needs to trust them.

## Constraints

- `1 <= n <= 1000`
- `0 <= trust.length <= 10^4`
- `trust[i].length == 2`
- `1 <= a, b <= n`, `a != b`
- No pair `[a, b]` appears in `trust` twice.

## Aim for

Picture each trust as an arrow from `a` to `b` — a directed graph. You don't need to walk it, only count: the judge has exactly `n - 1` arrows coming in and none going out. One pass over `trust` to tally the arrows in and out for every resident, then one pass over the residents: `O(n + T)` time and `O(n)` space, where `T` is the length of `trust`. Bonus: can a single number per resident do the job?

## Follow-ups

- Use one counter per resident instead of two. Why can only the judge reach `n - 1`?
- The trust list is too large for memory and arrives as a stream. What do you keep?
- You can't see the list at all; you can only ask "does `a` trust `b`?". Find the judge with `O(n)` questions. (This is "Find the Celebrity".)
