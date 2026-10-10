## Approach

Model the courses as a directed graph: each pair `[a, b]` is an edge `b -> a` ("finishing `b` unlocks `a`"). A valid order is a **topological order** of that graph, and one exists exactly when the graph has **no cycle**. Courses on a cycle each wait on another one in the loop, so none of them can ever go first.

**Kahn's algorithm** finds out by trying to schedule everything. Count, for every course, how many prerequisites it still lacks (its indegree). Every course at zero can be taken right now, so put them all in a queue. Then repeat: pop a course, count it as taken, and for each course it unlocks, decrement that course's count. A count that hits zero means the course's last prerequisite is done, so it joins the queue.

When the queue runs dry, compare the number taken with `numCourses`. If they're equal, the popping order was a valid schedule. If any course was never taken, its count never reached zero, which means it sits on a cycle or depends on a course that does.

Why the leftover test is exact: if the graph has no cycle, some course always has indegree zero (follow prerequisite edges backwards, and without a loop you must reach a course with none), so the queue never empties early. If there is a cycle, no course on it can be the first of the loop to reach zero, so none of them is ever taken.

**The DFS alternative** colours each course *unvisited*, *on the current path* or *finished*. Explore from every unvisited course. If you step onto a course that's on the current path, that's a back edge, so there's a cycle. Mark a course finished when you leave it, and never explore it again. Both parts matter. With only one visited set, the second route into a diamond looks like a loop (Example 1). With no finished state, every route gets re-walked, which is exponential on layered graphs. Recursion goes as deep as the longest chain of prerequisites.

## Complexity

`O(V + E)` time: each course is queued and popped once, and each pair is used once to build the graph and once to decrement. `O(V + E)` space for the adjacency lists, the counts and the queue.

## Pitfalls

- Treating "visited before" as "cycle". Two routes into the same course (a diamond) are fine. Only a course that's still on the current DFS path closes a loop.
- Searching only from course `0`, or only from the courses it reaches. A cycle can live in a part of the graph that course `0` never touches.
- Getting the edge direction backwards. For cycle detection alone, a reversed graph happens to give the same answer, but it bites in Course Schedule II, where the order itself matters.
