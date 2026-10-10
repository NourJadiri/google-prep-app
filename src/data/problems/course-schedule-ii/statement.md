# Course Schedule II

## The task

There are `numCourses` courses, labelled `0` to `numCourses - 1`, and you take them one at a time. Each pair `[a, b]` in `prerequisites` means course `b` must be finished before course `a` can start.

Return an order in which you can take every course: a list with each course exactly once, where every course comes after all of its prerequisites. When several orders work, any of them is accepted. When no order works, because some prerequisites loop back on each other, return an empty list `[]`. A partial order is not enough.

## Examples

**Example 1**

```
numCourses = 6, prerequisites = [[4,0],[4,2],[5,4],[1,5],[3,2]]   -> [0,2,4,3,5,1]
```

`0` and `2` need nothing. `4` needs both of them, `5` needs `4`, `1` needs `5`, and `3` needs `2`. Other orders, like `[2,3,0,4,5,1]`, are just as good.

**Example 2**

```
numCourses = 3, prerequisites = [[0,1],[1,0]]   -> []
```

Course `2` could be taken any time, but `0` and `1` each wait for the other, so there is no complete order.

**Example 3**

```
numCourses = 3, prerequisites = []   -> [0,1,2]
```

With no prerequisites, any of the six orders is accepted.

## Constraints

- `1 <= numCourses <= 2000`
- `0 <= prerequisites.length <= 5000`
- `prerequisites[i].length == 2`
- `0 <= a, b < numCourses` and `a != b`
- No pair appears twice.

## Aim for

Use Kahn's algorithm, where the popping order *is* the answer. Queue every course with no unmet prerequisites. Pop one, append it to the order, decrement the courses it unlocks, and queue each one that reaches zero. If the order comes out shorter than `numCourses`, the leftovers are stuck on a cycle, so return `[]`. `O(V + E)` time and space. DFS also works: a course finishes only after every course it unlocks has finished, so the reversed finishing order is a valid order, with the same three-state cycle check.

## Follow-ups

- Return the lexicographically smallest valid order. What replaces the queue, and what does it cost?
- Group the courses into as few semesters as possible, with no limit per semester, and return the semesters.
- When no order exists, return the courses of one actual cycle as evidence.
