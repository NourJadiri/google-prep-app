# Open the Lock

## The task

A combination lock has four wheels, each showing one digit from `0` to `9`. One move turns a single wheel by one notch, up or down. The wheels wrap around: `9` turns up to `0`, and `0` turns down to `9`. The lock starts at `"0000"`.

`deadends` lists codes that jam the lock: if the wheels ever show one of them, the lock seizes for good. So no sequence of moves may pass through a dead end, and if `"0000"` itself is a dead end, the lock can't be opened at all.

Return the minimum number of moves that makes the lock show `target`, or `-1` if it's impossible.

## Examples

**Example 1**

```
deadends = ["9000","0100"], target = "9100"   -> 4
```

Two moves would be enough (first wheel down from `0` to `9`, second wheel up to `1`), but both orders pass through a dead end. The lock has to detour through another wheel and back, for example `0000 → 0010 → 9010 → 9110 → 9100`.

**Example 2**

```
deadends = ["1011","9011","0111","0911","0021","0001","0012","0010"], target = "0011"   -> -1
```

Every code one move away from the target is a dead end, so the target can't be reached.

**Example 3**

```
deadends = ["0000"], target = "1234"   -> -1
```

The lock starts on a dead end.

## Constraints

- `1 <= deadends.length <= 500`
- `deadends[i].length == 4`, `target.length == 4`
- `deadends[i]` and `target` consist of digits only.
- `target` is not in `deadends`.

## Aim for

The codes form a graph: 10,000 nodes, each with eight neighbours (four wheels, two directions). Every move costs the same, so BFS from `"0000"` finds the fewest moves. Put the dead ends into the visited set before you start, so the search never enters them. That's about `10^4 · 8` steps, a constant. Be ready to say how it grows with `w` wheels of `d` digits, and how searching from both ends at once shrinks it.

## Follow-ups

- Search from both ends at once. Why is it faster, and when does it pay off?
- Return the sequence of codes, not just the number of moves.
- For A*, use the sum over the wheels of each wheel's circular distance to the target. Why is that heuristic admissible?
