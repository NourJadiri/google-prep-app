## Approach

Start with the widest container, the two end walls, and narrow it one wall at a time, always discarding the **shorter** of the two current walls. The answer is the largest area seen along the way.

Why discarding the shorter wall is safe: say `height[i] <= height[j]`. Every container still available that uses wall `i` pairs it with some wall `k` strictly between `i` and `j`. Its width `k - i` is smaller than `j - i`, and its water level `min(height[i], height[k])` is at most `height[i]`, which is no higher than now. So none of those containers can beat `(i, j)`, which is already recorded, and wall `i` can go. When the heights are equal, the same argument applies to either wall, so moving either one is fine.

Every step permanently rules out one wall, and the argument shows that nothing it rules out could have beaten the best area recorded so far. After `n - 1` steps, every pair has either been measured or been shown no better than one that was. That exchange argument is the part interviewers want to hear out loud.

## Complexity

`O(n)` time: the pointers only move toward each other, one step per iteration. `O(1)` extra space.

## Pitfalls

- Moving the taller wall. The shorter wall caps the water, so keeping it while narrowing can only lose.
- Width off by one: walls `i` and `j` are `j - i` apart, not `j - i + 1`.
- Taking the `max` of the two heights instead of the `min`. The water spills over the shorter wall.
