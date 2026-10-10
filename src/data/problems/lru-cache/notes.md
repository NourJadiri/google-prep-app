## Approach

**Two structures, each covering the other's weakness.** A hash map finds any key in `O(1)` but knows nothing about order. A doubly linked list keeps an order and can unlink any node in `O(1)` — once you're holding the node — but finding a node means walking the list. Put them together: the map goes from key to list node, and the list holds the nodes in recency order, most recent at the front.

- **`get(key)`:** look the node up in the map. Missing: return `-1`. Found: unlink it and re-insert it at the front — a read is a use — then return its value.
- **`put(key, value)`:** if the key is already there, update the value and move its node to the front; the cache isn't growing, so nothing is evicted. Otherwise, if the cache is full, evict the node at the back, the least recently used: unlink it *and* delete its key from the map, which is why every node stores its own key. Then create the new node, record it in the map, and insert it at the front.

**Sentinels.** A dummy `head` and `tail` that are always present give every real node a real `prev` and `next`. Unlinking is then always `e.prev.next, e.next.prev = e.next, e.prev`, with no `None` checks, and the least recently used node is simply `tail.prev`.

**Why doubly linked?** Unlinking a node from the middle needs its predecessor, and a singly linked list can only find that by walking from the head — `O(capacity)` again.

**The library shortcut.** `collections.OrderedDict` is exactly this pair of structures: `move_to_end(key)` on every use and `popitem(last=False)` to evict. Good to mention and fine for quick code, but in an interview expect "now build it without that".

## Complexity

`get` and `put` are `O(1)` on average: one hash map operation and a constant number of pointer updates. Space is `O(capacity)`: one map entry and one node per key, plus the two sentinels.

## Pitfalls

- Treating `get` as read-only. A read must move the key to the front, or a key that is read constantly gets evicted as if it had been forgotten.
- Evicting before checking whether `put`'s key already exists: updating a key in a full cache must not evict anything.
- Testing a stored value for truthiness (`if self.cache.get(key):`) — values can be `0`.
- Forgetting to delete the evicted key from the map: the map keeps growing, and a later `get` finds a detached node and returns a value that should be gone.
