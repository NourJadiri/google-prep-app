## Approach

Walk the list once, turning each link around as you pass it. Three names do it: `prev` (the reversed part so far), `cur` (the node being turned), and `nxt` (the rest of the original list, saved *before* `cur.next` is overwritten — lose it and the rest of the list is gone).

Each step: save `nxt`, point `cur.next` at `prev`, then move both `prev` and `cur` one step forward. When `cur` runs off the end, `prev` is the old tail, which is the new head.

The recursive version reverses `head.next` onward first, then hangs `head` on the end: `head.next.next = head; head.next = None`.

## Complexity

Iterative: `O(n)` time, `O(1)` extra space. Recursive: `O(n)` time but `O(n)` call stack.

## Pitfalls

- Forgetting to save `nxt` before turning the link.
- Returning `head` (now the tail) instead of `prev`.
