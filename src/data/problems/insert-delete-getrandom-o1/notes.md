## Approach

Each requirement rules out one obvious structure. `getRandom` in `O(1)` needs the members laid out at positions `0..k-1`, so that one random index picks one member — a list. Finding a value in `O(1)`, to answer `insert`'s "already there?" and to delete it, needs hashing — a dictionary. So keep both, and keep them in step: `vals` is a list of the members in no particular order, and `pos[v]` is the index where `v` sits in `vals`.

- `insert(v)`: if `v` is in `pos`, return `False`. Otherwise append it to `vals` and record `pos[v] = len(vals) - 1`.
- `getRandom()`: `random.choice(vals)`. Every member occupies exactly one slot, so each comes back with probability `1/k`.
- `remove(v)`: deleting from the middle of a list shifts everything after it — `O(n)`. But the list's order means nothing, so don't shift: pop the **last** element and drop it into `v`'s hole, then update the moved element's entry in `pos`. If `v` was itself the last element, the pop alone removes it and there is no hole to fill.

The invariant that makes it correct: after every operation, `vals` holds each member exactly once and `pos[vals[i]] == i` for every `i`. Insert extends both sides together; remove changes exactly two facts — `v` is gone, and the old last element now lives at `v`'s index — and updates both. With no duplicates and no stale slots, uniform choice over `vals` is uniform choice over the set.

## Complexity

`O(1)` average per operation: dictionary lookups, inserts and deletes are `O(1)` on average, and list append, pop-from-the-end and index assignment are `O(1)` (append amortised). `O(n)` space for the two structures.

## Pitfalls

- Order of the bookkeeping in `remove`. Writing `pos[last] = i` *after* deleting `pos[v]` resurrects `v` whenever `v` was the last element — the set then claims to hold a value its list doesn't. Popping first and checking `i < len(vals)` (as the reference does) sidesteps it.
- Forgetting `pos[last] = i` altogether: the moved element keeps its old index, and removing it later deletes the wrong slot.
- `if pos.get(v):` as a membership test — the member at index `0` looks absent. Use `v in pos`.
- Tombstones (marking a slot `None` instead of filling it) break uniformity unless you re-roll on a hole; "step to the next live slot" favours whatever sits after a run of holes.
- Converting the set to a list inside `getRandom` is uniform but `O(n)` per call.
