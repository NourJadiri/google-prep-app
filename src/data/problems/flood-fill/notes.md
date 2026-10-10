## Approach

**The pattern: search the grid as if it were a graph.** Each pixel is a node, joined to the pixels directly above, below, left and right of it — its *4-neighbours*. A lot of grid problems ("fill this area", "count the islands", "can you walk from here to there?") are the same question underneath: *which cells can I reach from this one, moving only through cells that pass some test?* For flood fill the test is "has the clicked pixel's original colour".

There are two standard ways to explore everything reachable, and both work here.

**Depth-first search (DFS), with recursion.** Write a function `fill(r, c)` that deals with one pixel and trusts recursion with the rest:

1. If `(r, c)` is off the grid, or isn't the original colour, return — it isn't part of the region (or it's already painted).
2. Otherwise paint it, then call `fill` on its four neighbours.

The checks at the top are the base cases: they're what makes the recursion stop. The painting does double duty: once a pixel is `color`, it no longer matches the original colour, so the search never enters it again. That's your "visited" mark, free of charge.

**Breadth-first search (BFS), with a queue.** Paint the clicked pixel and put it in a queue. Repeatedly take the pixel at the front; for each neighbour that's on the grid and still the original colour, paint it and add it to the back. When the queue is empty, the region is done. The paint spreads outward in rings, like ink soaking into paper:

```python
start, rows, cols = image[sr][sc], len(image), len(image[0])
if start == color:
    return image                   # see "the one special case" below
image[sr][sc] = color
queue = deque([(sr, sc)])
while queue:
    r, c = queue.popleft()
    for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
        if 0 <= nr < rows and 0 <= nc < cols and image[nr][nc] == start:
            image[nr][nc] = color      # paint (= mark) when queued, so it's queued once
            queue.append((nr, nc))
return image
```

**The one special case.** Both versions rely on "painted" meaning "visited". If `color` already equals the original colour, painting changes nothing, every pixel keeps looking unvisited, and the search bounces between neighbours forever — a crash for the recursion, a hang for the queue. The right answer in that case is just the unchanged picture, so check for it first and return.

**Why it's correct.** A pixel belongs to the region exactly when a chain of side-by-side steps leads to it from the clicked pixel, every step landing on the original colour. The search tries every step from every pixel it paints, so it reaches the whole region; and it never paints a pixel that fails the colour test, so nothing outside the region changes.

**Spotting it next time.** A grid plus words like *connected*, *region*, *spread*, *reachable*, *island* or *fill* points to a BFS or DFS from a starting cell (or from every not-yet-visited cell, when you need all the regions). The skeleton is always the same: bounds check, "does this cell qualify?", mark it, visit the four neighbours.

## Complexity

`O(m * n)` time: each pixel is painted at most once, and each painted pixel looks at four neighbours. Extra space is `O(m * n)` in the worst case — when the whole picture is one region, the recursion stack (DFS) or the queue (BFS) can hold a large share of it.

## Pitfalls

- Not handling `color == image[sr][sc]`: an endless loop instead of an unchanged picture.
- Testing "is this pixel already `color`?" instead of "is it the original colour?" — the paint leaks into every other colour it touches.
- Including diagonals: pixels that share only a corner aren't neighbours here.
- Reading the original colour *after* painting the first pixel. Save `start = image[sr][sc]` before anything changes.
