# Time Based Key-Value Store

## The task

Build a key-value store that keeps every version of every value, so you can ask what a key held at any moment in the past. Implement `class TimeMap`:

- `TimeMap()` — starts empty
- `set(key, value, timestamp)` — records that `key` holds `value` from `timestamp` on
- `get(key, timestamp)` — returns the value `key` held at `timestamp`: the one recorded by the `set` on that key with the largest timestamp that is `<= timestamp`. If no `set` on `key` happened at or before `timestamp`, return `""`.

The timestamps passed to `set` strictly increase from one call to the next, across all keys. The timestamps passed to `get` can be anything in range, in any order.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation — `null` for the constructor and for `set`.

## Examples

**Example 1**

```
ops  = ["TimeMap","set","set","get","get","get","get"]
args = [[],["door","red",3],["door","blue",8],["door",2],["door",3],["door",7],["door",100]]
                                -> [null,null,null,"","red","red","blue"]
```

At time `2` nothing had been stored yet. A value takes effect at its own timestamp (`get` at `3` sees `"red"`) and stays current until it's replaced — `"red"` is still the answer at `7`, and `"blue"` at `100`.

**Example 2**

```
ops  = ["TimeMap","set","set","set","get","get","get"]
args = [[],["a","x",1],["b","y",2],["a","z",5],["b",4],["a",4],["c",9]]
                                -> [null,null,null,null,"y","x",""]
```

Each key has its own history: at time `4`, `"b"` holds `"y"` and `"a"` still holds `"x"`. Key `"c"` was never set.

## Constraints

- `1 <= key.length, value.length <= 100`
- `key` and `value` consist of lowercase English letters and digits.
- `1 <= timestamp <= 10^7`
- The timestamps of `set` calls are strictly increasing.
- At most `2 * 10^5` calls to `set` and `get` in total.

## Aim for

`O(1)` per `set`, `O(log n)` per `get`, `O(total sets)` space. Per key, keep the timestamps in a list (and the values alongside). Because `set` timestamps only increase, appending keeps every list sorted — no tree, no re-sorting. `get` is then a binary search for the last timestamp `<= t`. Say which `bisect` gives you that index, and check it on a `get` at exactly a stored timestamp.

## Follow-ups

- `set` timestamps can arrive out of order. What does each operation cost now, and what structure would you reach for?
- Versions older than a day must be dropped to save memory. Where does that work happen?
- Add `getRange(key, t1, t2)` returning every value set in that window.
