# Subtree of Another Tree

## The task

You're given the roots of two binary trees, `root` and `subRoot`. Return `True` if `root` contains a subtree identical to `subRoot`, and `False` otherwise.

A subtree of `root` is one of its nodes together with **all** of that node's descendants. It's identical to `subRoot` when it has exactly the same shape and equal values in matching positions. So a subtree that starts out matching `subRoot` but has extra nodes further down doesn't count. Every tree is a subtree of itself.

Trees are written in level order: the values row by row from the top, each row left to right, with `null` where a child is missing. Missing children after the last node are left off.

## Examples

**Example 1**

```
root = [5,8,2,null,null,6,1], subRoot = [2,6,1]   -> true
```

The subtree under `2` is exactly `subRoot`.

**Example 2**

```
root = [5,8,2,null,null,6,1,null,null,3], subRoot = [2,6,1]   -> false
```

Now `1` has a left child `3`. A subtree includes everything below its top node, so the subtree under `2` no longer matches.

**Example 3**

```
root = [1,4,4,2,null,null,9], subRoot = [4,null,9]   -> true
```

The first `4` (with a left child `2`) doesn't match, but the second one does.

## Constraints

- `1 <= number of nodes in root <= 2000`
- `1 <= number of nodes in subRoot <= 1000`
- `-10^4 <= Node.val <= 10^4`
- `root` is at most `1000` levels deep.

## Aim for

You already know how to tell whether two trees are identical — that's Same Tree. The only new question is where in `root` the copy might start. It could start at `root` itself; if it doesn't, where else could it be? Write that as a recursion that tries every node, reusing Same Tree for each comparison. That's `O(m·n)` in the worst case for trees of `m` and `n` nodes, which is fine at these sizes.

## Follow-ups

- Get it down to `O(m + n)`: write both trees out as strings, with markers for missing children, and search for one inside the other. What separators do you need so that `2` doesn't match inside `12`?
- Count how many times `subRoot` appears in `root`.
- What changes if `subRoot` only has to match the top part of some subtree, with extra nodes below allowed?
