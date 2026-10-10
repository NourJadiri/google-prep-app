## Approach

**Say the plain answers first.** A set works: add a number the first time you see it, remove it the second time, and the one number left in the set is the answer. So does a dictionary of counts. Both are `O(n)` time — and both use `O(n)` extra space, which is what the interviewer will ask you to get rid of.

**The pattern: XOR cancels pairs.** XOR ("exclusive or", written `^` in Python) compares two numbers bit by bit. Each bit of the result is `1` where the two bits differ and `0` where they're the same:

```
  0110    (6)
^ 0101    (5)
------
  0011    (3)
```

Three facts make it perfect for this problem:

- `a ^ a == 0`: every bit matches itself, so a number cancels its twin.
- `a ^ 0 == a`: XOR with zero changes nothing.
- Order doesn't matter: `a ^ b ^ c` gives the same result in any order and with any grouping.

So XOR every number in the list together, starting from `0`. Because order doesn't matter, you can imagine sliding each pair of twins next to each other: every pair becomes `0`, the zeros change nothing, and only the single number is left.

On `[7,3,5,3,7]` the running value wanders around — `7`, then `4`, `1`, `2` — and lands on `5`, because `7 ^ 3 ^ 5 ^ 3 ^ 7` is the same as `(7 ^ 7) ^ (3 ^ 3) ^ 5`, which is `0 ^ 0 ^ 5`, which is `5`. The values in between don't mean anything on their own; only the final one does.

Negative numbers work too. Python treats a negative number as if it had infinitely many leading `1` bits, and those cancel in pairs just like every other bit.

**Spotting it next time:** "every element appears twice except one", "find the odd one out", "everything has a partner but one" — or a demand for `O(1)` space where a set would be the obvious tool — think XOR. Missing Number uses the same cancelling idea.

## Complexity

`O(n)` time: one pass, one `^` per number. `O(1)` extra space: a single running value.

## Pitfalls

- Starting the running value at `nums[0]` and then XOR-ing all of `nums`. The first number is counted twice and cancels itself; on `[6]` the answer comes out as `0`.
- Sorting and checking the pairs `(0,1)`, `(2,3)`, … but forgetting that the single number can be the very last element, with nothing to pair against.
- Counting with `nums.count(x)` for each `x`. It's correct, but each call scans the whole list, which makes it `O(n^2)`.
