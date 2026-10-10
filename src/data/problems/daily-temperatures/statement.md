# Daily Temperatures

## The task

`temperatures[i]` is the temperature on day `i`. For every day, work out how many days you'd have to wait for a **strictly warmer** one. Return a list `answer` of the same length, where `answer[i]` is the number of days from day `i` to the first later day that is warmer, or `0` if no later day is.

## Examples

**Example 1**

```
temperatures = [64,66,65,61,62,70,63]   -> [1,4,3,1,1,0,0]
```

Day `1` (66) waits until day `5` (70): four days. Days `5` and `6` never see anything warmer.

**Example 2**

```
temperatures = [50,50,51]   -> [2,1,0]
```

An equal temperature isn't warmer: day `0` has to wait for day `2`.

**Example 3**

```
temperatures = [90,80,70]   -> [0,0,0]
```

A cooling streak: no day has a warmer day after it.

## Constraints

- `1 <= temperatures.length <= 10^5`
- `30 <= temperatures[i] <= 100`

## Aim for

`O(n)` time with a monotonic stack of indices — the days still waiting for a warmer day, whose temperatures never rise from bottom to top. For each new day, pop every waiting day that is colder and record its wait, then push the new day. Each index is pushed once and popped at most once. Scanning forward from every day is `O(n^2)`: a long run of equal days makes it take billions of steps.

## Follow-ups

- Sweep from right to left instead. What does the stack hold then?
- Temperatures only range from 30 to 100. How could that give an `O(71 * n)` solution with no stack at all?
- Return the distance to the previous warmer day instead, or to the next colder one. What changes?
