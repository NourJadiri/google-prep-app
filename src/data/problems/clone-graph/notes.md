## Approach

Copying a tree is easy: copy the node, then recurse into its children. A graph adds two complications. **Cycles**: follow neighbours from node `1` and you can come back to node `1`. **Shared nodes**: two nodes can point at the same neighbour. A naive copy either loops forever or makes a second copy of a node it already copied.

One hash map fixes both: `copies`, from each original node to its copy. To clone a node, first check the map, and if the node is there, return the existing copy. Otherwise create the copy, **store it in the map before looking at any neighbour**, then clone each neighbour in order and append the result to the copy's `neighbors`.

That order is the whole trick. When a cycle leads back to a node whose copy is still being filled in, the lookup finds that copy instead of starting another. So every original node is copied exactly once, and every edge is recreated between copies, in the original order.

**BFS works the same way.** Create the start node's copy and queue the start node. For every node you dequeue, look up each neighbour's copy, creating and queueing it if it's new, and append it to the dequeued node's copy. Append it in both cases. The classic BFS bug appends only when the neighbour's copy is newly created, and that silently drops every edge into a node that was copied earlier.

Key the map by the node object itself (its identity). Keying by `val` happens to work here only because the values are unique.

## Complexity

`O(V + E)` time: each node is copied once, and each adjacency entry is followed once. `O(V)` extra space for the map, plus the recursion stack (up to `V` deep for DFS) or the BFS queue.

## Pitfalls

- Returning the original node, or handing the copy the original's `neighbors` list. Either way, the "copy" shares nodes with the original.
- Creating or registering the copy *after* recursing into the neighbours. A cycle then recurses forever.
- In BFS, linking a neighbour only when its copy is first created. Back edges disappear.
