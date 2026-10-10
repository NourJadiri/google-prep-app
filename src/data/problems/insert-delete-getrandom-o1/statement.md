# Insert Delete GetRandom O(1)

## The task

Build a set of integers that can also hand back a member chosen at random. Implement `class RandomizedSet`:

- `RandomizedSet()` — starts empty
- `insert(val)` — adds `val` if it isn't already a member; returns `True` if it was added, `False` if it was already there
- `remove(val)` — deletes `val` if it is a member; returns `True` if it was deleted, `False` if it wasn't there
- `getRandom()` — returns a current member, chosen uniformly: with `k` members, each one comes back with probability `1/k`. It is only called while the set is non-empty.

Every operation must take `O(1)` time on average.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation — `null` for the constructor, `true` or `false` for `insert` and `remove`. A `getRandom` result can't be predicted, so its expected entry is `"ok"`: the checker records `"ok"` in place of your value when it is a member at that moment, and a sentence describing the problem when it isn't. Some tests also call `getRandom` thousands of times in a row on an unchanging set and check that every member comes up about equally often — the bounds are loose enough that a fair implementation passes essentially every time.

## Examples

**Example 1**

```
ops  = ["RandomizedSet","insert","insert","insert","remove","getRandom","insert","remove","getRandom"]
args = [[],[4],[9],[4],[4],[],[-2],[7],[]]
                                -> [null,true,true,false,true,"ok",true,false,"ok"]
```

The second `insert(4)` finds `4` already there. After `remove(4)` the set is `{9}`, so the first `getRandom` must return `9`. Nothing was ever stored under `7`. The last `getRandom` returns `9` or `-2`, each half the time.

**Example 2**

```
ops  = ["RandomizedSet","remove","insert","remove","insert","getRandom"]
args = [[],[5],[5],[5],[5],[]]
                                -> [null,false,true,true,true,"ok"]
```

Removing from an empty set is allowed and returns `false`. A value can leave and come back.

**Example 3**

```
ops  = ["RandomizedSet","insert","insert","insert","remove","remove","getRandom"]
args = [[],[1],[2],[3],[1],[3],[]]
                                -> [null,true,true,true,true,true,"ok"]
```

Only `2` is left, so `getRandom` must return `2`.

## Constraints

- `-2^31 <= val <= 2^31 - 1`
- At most `2 * 10^5` calls in total to `insert`, `remove` and `getRandom`.
- `getRandom` is only called when the set has at least one member.

## Aim for

`O(1)` average for all three operations, `O(n)` space. Neither structure does it alone: a hash set finds and deletes in `O(1)` but has no positions to roll a die over, and a list can pick a random index but can't find a value without scanning. Keep both — a list of the members, and a dictionary from each member to its index in that list. Deleting from the middle of the list is the crux: move the **last** element into the hole, fix that element's index in the dictionary, then pop the end.

## Follow-ups

- Allow duplicates: `insert` always adds a copy, `remove` deletes one copy, and `getRandom` weights each value by how many copies there are. What does the dictionary map to now?
- Return `k` distinct random members in one call. Why not just call `getRandom` `k` times?
- `random.choice(list(self.members))` is perfectly uniform. What's wrong with it here?
