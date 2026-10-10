## Approach

Each pair `[a, b]` is a directed edge `b -> a`, and a valid schedule is a **topological order** of that graph. **Kahn's algorithm** builds one directly, by simulating the schedule.

Count each course's unmet prerequisites (its indegree), and queue every course at zero. Then repeat: pop a course, append it to `order`, and decrement the count of every course it unlocks. A count that reaches zero means that course's last prerequisite just went into `order`, so it can be queued. A course enters the queue only after all of its prerequisites are already in `order`, so `order` respects every pair by construction.

When the queue empties, either every course is in `order` (return it) or some never reached zero. Those leftovers each wait on another leftover, which means they sit on a cycle or behind one, so no complete order exists and the answer is `[]`. Returning the partial `order` there is the classic bug (Example 2).

Many orders can be valid. Kahn's returns whichever its queue discipline produces. A heap instead of a FIFO queue gives the lexicographically smallest order, for an extra `log V` per course.

**DFS gives an order too.** Run the three-state DFS from Course Schedule (unvisited, on the path, finished). When a course *finishes*, everything it unlocks has already finished. So the finishing order lists every course after the courses it unlocks, which is backwards. Reverse it to get a valid schedule. Stepping onto a course that's still on the path means a cycle, so return `[]`.

## Complexity

`O(V + E)` time: each course is queued once, and each pair is followed once. `O(V + E)` space for the adjacency lists, the counts, the queue and the order.

## Pitfalls

- Returning a partial order when a cycle exists. The leftover check (`len(order) == numCourses`) is the whole cycle test.
- Reversing the edges, so that each course is scheduled before its prerequisites. Trace Example 1 by hand to check that the order points the right way.
- DFS postorder without the final reversal: it lists every course *after* the courses it unlocks.
