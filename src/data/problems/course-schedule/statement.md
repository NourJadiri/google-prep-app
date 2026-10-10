# Course Schedule

## The task

You have to take `numCourses` courses, labelled `0` to `numCourses - 1`, one at a time. Some courses have prerequisites: each pair `[a, b]` in `prerequisites` means course `b` must be finished before you can start course `a`.

Return `true` if some order of the courses respects every pair, so that you can finish them all, and `false` if no such order exists. A course can even list itself (`[a, a]`), and then it can never be taken.

## Examples

**Example 1**

```
numCourses = 5, prerequisites = [[2,0],[2,1],[3,2],[4,3],[4,0]]   -> true
```

Take `0`, `1`, `2`, `3`, `4` in that order. Course `4` is reached from `0` along two routes (directly, and through `2` and `3`), but two routes to one course are not a loop.

**Example 2**

```
numCourses = 4, prerequisites = [[1,0],[2,1],[3,2],[1,3]]   -> false
```

Course `0` is fine, but `1` needs `3`, `3` needs `2`, and `2` needs `1`: none of the three can ever go first.

**Example 3**

```
numCourses = 1, prerequisites = []   -> true
```

## Constraints

- `1 <= numCourses <= 2000`
- `0 <= prerequisites.length <= 5000`
- `prerequisites[i].length == 2`
- `0 <= a, b < numCourses`
- No pair appears twice.

## Aim for

Courses are nodes, and each pair is a directed edge `b -> a`. Everything can be finished exactly when that graph has no cycle. The interview answer is Kahn's algorithm: count each course's unmet prerequisites (its indegree), queue every course at zero, then pop, "take" the course, and decrement the courses it unlocks, queueing each one that hits zero. If every course gets popped, there's no cycle. A DFS with three states (unvisited, on the current path, finished) also works: reaching a course that's still on the path means a cycle. Both are `O(V + E)`.

## Follow-ups

- Return an actual order in which to take the courses (that's Course Schedule II).
- With no limit on courses per semester, what's the fewest semesters that finish everything?
- Which courses can never be taken? Not just the ones on a cycle: everything downstream of one too.
