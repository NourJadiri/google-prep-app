# LRU Cache

## The task

Design a fixed-size key-value cache that, when it runs out of room, evicts the **least recently used** key. Implement `class LRUCache`:

- `LRUCache(capacity)` — an empty cache that holds at most `capacity` keys
- `get(key)` — return the value stored under `key`, or `-1` if `key` isn't in the cache
- `put(key, value)` — store `value` under `key`, replacing any old value. If `key` is new and the cache is already full, first evict the least recently used key.

A key counts as used whenever `get` finds it or `put` writes it; a `get` that misses uses nothing. Both operations must run in `O(1)` average time.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation — `null` for the constructor and for `put`.

## Examples

**Example 1**

```
ops  = ["LRUCache","put","put","put","get","put","get","get","get"]
args = [[3],[5,50],[6,60],[7,70],[5],[8,80],[6],[5],[8]]
                                                    -> [null,null,null,null,50,null,-1,50,80]
```

After three `put`s the cache is full and `5` is the least recently used key. `get(5)` uses it, so `put(8, 80)` evicts `6` instead — and `get(6)` misses.

**Example 2**

```
ops  = ["LRUCache","put","put","put","put","get","get"]
args = [[2],[4,1],[9,2],[4,7],[3,5],[9],[4]]
                                                    -> [null,null,null,null,null,-1,7]
```

Writing `4` again replaces its value and makes it the most recently used key, so `put(3, 5)` evicts `9`.

**Example 3**

```
ops  = ["LRUCache","put","get","put","get","get"]
args = [[1],[0,0],[0],[2,6],[0],[2]]
                                                    -> [null,null,0,null,-1,6]
```

With room for one key, every new key evicts the previous one. A stored `0` is a real value: only a missing key returns `-1`.

## Constraints

- `1 <= capacity <= 3000`
- `0 <= key <= 10^4`
- `0 <= value <= 10^5`
- At most `2 * 10^5` calls to `get` and `put` in total.

## Aim for

`O(1)` per operation from two structures that cover each other's weakness: a hash map from key to node, to find any key, and a doubly linked list in recency order, to move a node to the front and evict from the back in constant time. Sentinel head and tail nodes remove the edge cases. Keeping the recency order in a plain list, or scanning timestamps for the oldest key, makes an operation `O(capacity)`, and the large tests punish both. `OrderedDict` with `move_to_end` and `popitem(last=False)` is worth mentioning — then expect to be asked to build it yourself.

## Follow-ups

- Make it safe to call from many threads. What must be locked, and can two reads run at once?
- Evict the least *frequently* used key instead, breaking ties by recency. Can it stay `O(1)`?
- Entries also expire after a time-to-live. How do expiry and recency eviction interact?
