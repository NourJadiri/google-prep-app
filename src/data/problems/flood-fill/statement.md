# Flood Fill

## The task

You're writing the paint-bucket tool for a pixel-art editor. The picture is `image`, a grid with `m` rows and `n` columns: `image[r][c]` is the colour of the pixel in row `r`, column `c` — written `(r, c)` below — and colours are plain integers. The user clicks the pixel `(sr, sc)` with the bucket loaded with colour `color`.

The click repaints the clicked pixel's **region** to `color`. The region is the clicked pixel plus every pixel you can reach from it by stepping up, down, left or right, one pixel at a time, landing only on pixels that have the clicked pixel's original colour. Diagonal steps don't count: two pixels that touch only at a corner aren't neighbours.

Return the picture after the fill: every pixel of the region now `color`, every other pixel unchanged. You may repaint `image` in place and return it, or return a new grid.

## Examples

**Example 1**

```
image = [[1,1,0,2],[0,1,0,1],[1,1,1,0],[0,0,0,1]], sr = 0, sc = 0, color = 9
        -> [[9,9,0,2],[0,9,0,1],[9,9,9,0],[0,0,0,1]]
```

From `(0,0)` the paint runs right to `(0,1)`, down through `(1,1)` to `(2,1)`, then out to both sides along row 2. The 1s at `(1,3)` and `(3,3)` touch the region only at corners, so they stay 1.

**Example 2**

```
image = [[0,0,0],[0,5,0],[0,0,0]], sr = 1, sc = 0, color = 3   -> [[3,3,3],[3,5,3],[3,3,3]]
```

The paint flows all the way around the 5 but never onto it: 5 isn't the clicked colour.

**Example 3**

```
image = [[4,4,4],[4,3,4]], sr = 1, sc = 0, color = 4   -> [[4,4,4],[4,3,4]]
```

The clicked region is already colour 4, so the picture comes back exactly as it was.

## Constraints

- `m == image.length`, `n == image[i].length`
- `1 <= m, n <= 50`
- `0 <= image[i][j], color < 2^16`
- `0 <= sr < m`, `0 <= sc < n`

## Aim for

Picture the grid as a graph: every pixel is a node, linked to the up-to-four pixels beside it. The region is everything reachable from the clicked pixel without leaving its colour — exactly what a depth-first search (recursion) or a breadth-first search (a queue) explores. Repaint as you go so no pixel is handled twice: `O(m * n)` time. Before you start, compare `color` with the clicked pixel's colour, and ask what your search would do if they were equal.

## Follow-ups

- Diagonal neighbours count too. What changes in your code?
- The picture is 10,000 x 10,000 pixels. Why might the recursive version crash, and how does an explicit stack or queue avoid that?
- Count how many separate regions the picture has. (That's "Number of Islands" in disguise.)
