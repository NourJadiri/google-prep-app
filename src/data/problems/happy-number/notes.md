## Approach

Simulating the process is the easy part. The hard part is knowing when to stop if the answer is "no".

**First: why it must either reach 1 or loop.** A number with `d` digits has a digit-square sum of at most `81 * d`. For any number with four or more digits, that's smaller than the number itself, so big numbers shrink fast: even `2^31 - 1` drops below `1,000` in a single step. And once you're at `999` or below, you stay at `243` or below (`3 * 81`). The sequence is trapped among a few hundred values, so sooner or later it has to repeat one. Once a value repeats, everything after it repeats too: you're in a loop. Either that loop is just `1 → 1`, or the number isn't happy.

So the real question is: **does this sequence run into a loop, and is the loop at `1`?** That's cycle detection.

**Way 1: a set of seen numbers.** Walk the sequence and keep a set. Stop when you reach `1` (happy) or a number that's already in the set (a loop without `1`, so not happy). It's simple, and it's a great first answer.

**Way 2: Floyd's tortoise and hare (the reference solution).** Picture each number as a node in a linked list whose `next` is its digit-square sum. You may have met this in Linked List Cycle: start a slow runner and a fast runner, and each turn move the slow one one step and the fast one two steps. If the sequence reaches `1`, the fast runner gets there first and stays there. If the sequence loops without `1`, both runners end up going round the loop, and the fast one closes the gap by one step per turn until they land on the same number. No set needed: `O(1)` space.

The reference starts the fast runner one step ahead (`fast = step(n)`), so `slow != fast` isn't false by accident before anyone has moved.

**A fun fact you shouldn't rely on.** Every unhappy number eventually falls into the same loop, `4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4`, so you could stop as soon as you see `4`. In an interview, though, derive the stopping rule with cycle detection rather than reciting trivia.

**Spotting it next time.** "Apply the same step over and over: does it ever reach X, or does it go on forever?" The sequence is a linked list in disguise, so use a seen-set or fast and slow pointers. The same idea finds the repeat in Find the Duplicate Number, where each value in an array is read as a `next` pointer.

## Complexity

Each step costs time proportional to the number of digits. The first step takes `O(log n)` and leaves a number below `1,000`; from then on, every value stays at `243` or below, so reaching `1` or closing the loop takes a bounded number of cheap steps. Total: `O(log n)` time. Space: `O(1)` for Floyd's, while the set version holds at most a few hundred numbers.

## Pitfalls

- Looping until you reach `1`, with no cycle check. Unhappy numbers never get there, so the code runs forever.
- Stopping at the first single-digit number and calling only `1` happy. `7` is happy too: `7 → 49 → 97 → 130 → 10 → 1`.
- Starting both runners on the same number and checking `slow == fast` before moving them: the check is true straight away.
