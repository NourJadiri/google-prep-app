# Best Time to Buy and Sell Stock

## The task

`prices[i]` is the price of a stock on day `i`. You may make one trade: buy a single share on one day and sell it on a **later** day. Return the largest profit (sell price minus buy price) you can make. If no trade makes money, don't trade, and return `0`.

## Examples

**Example 1**

```
prices = [9,4,7,3,8,6]   -> 5
```

Buy on day 3 at `3`, sell on day 4 at `8`. (Days count from 0.)

**Example 2**

```
prices = [5,11,3,8,2]   -> 6
```

Buy at `5`, sell at `11`. The highest price minus the lowest would be `11 - 2 = 9`, but the `2` comes after the `11`, and you can't sell before you buy.

**Example 3**

```
prices = [8,6,5,5,1]   -> 0
```

The price never goes up, so the best plan is not to trade at all.

## Constraints

- `1 <= prices.length <= 10^5`
- `0 <= prices[i] <= 10^4`

## Aim for

Trying every buy day with every later sell day is `O(n^2)`, far too slow for `10^5` days. Aim for one pass: `O(n)` time and `O(1)` space. Suppose you sell today. Which earlier day would you have wanted to buy on? What's the one fact about the past you need to remember to answer that?

## Follow-ups

- Return the buy day and the sell day, not just the profit.
- You may make as many trades as you like, holding at most one share at a time. What's the best total profit now?
- Every trade costs a fixed fee. How does that change the many-trades version?
