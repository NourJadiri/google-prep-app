# Accounts Merge

## The task

A sign-up system hands you a list `accounts`. Each entry is one account: `accounts[i][0]` is the holder's name, and every item after it is an email address registered on that account.

Two accounts belong to the same person when they share at least one email, and the relation chains: if account A shares an email with B, and B shares one with C, then A, B and C are all one person, even if A and C have nothing in common directly. Names prove nothing. Different people can have the same name, so same-name accounts with no chain of shared emails stay separate. All accounts of one person do carry the same name.

Merge each person's accounts into a single list: the name first, then every email that appears on any of that person's accounts, each exactly once, in sorted order. Sorted means plain character-code order, which is what Python's `sorted` does to strings. So `.` comes before digits, digits before `@`, `@` before `_`, and `_` before letters. Return the merged accounts in any order.

## Examples

**Example 1**

```
accounts = [["Ana","ana@work.io","ana.r@home.net"],["Ben","ben@work.io"],["Ana","ana_99@game.gg","ana@work.io"],["Ana","ana@school.edu"]]
-> [["Ana","ana.r@home.net","ana@work.io","ana_99@game.gg"],["Ben","ben@work.io"],["Ana","ana@school.edu"]]
```

The first and third accounts share `ana@work.io`, so they merge. The last "Ana" shares no email with them: she's someone else.

**Example 2**

```
accounts = [["Kim","k1@mail.com","k2@mail.com"],["Kim","k3@mail.com","k4@mail.com"],["Kim","k2@mail.com","k3@mail.com"]]
-> [["Kim","k1@mail.com","k2@mail.com","k3@mail.com","k4@mail.com"]]
```

The first two accounts share nothing, but the third one overlaps both, so all three belong to one person.

**Example 3**

```
accounts = [["Lee","lee@x.org","lee@x.org"]]   -> [["Lee","lee@x.org"]]
```

An email listed twice still appears once in the result.

## Constraints

- `1 <= accounts.length <= 1000`
- `2 <= accounts[i].length <= 10`
- `1 <= accounts[i][j].length <= 30`
- `accounts[i][0]` consists of English letters.
- For `j >= 1`, `accounts[i][j]` is an email made of lowercase letters, digits, `.` and `_`, with exactly one `@`.
- Accounts that share an email have the same name. An email may repeat within one account.

## Aim for

This is connected components with the edges hidden inside strings: accounts are nodes, and a shared email is an edge. Use union-find over account indices, plus a map from each email to the first account that had it. Every repeat sighting of an email is one union. At the end, group the distinct emails by root and sort each group. With `N` total emails, that's `O(N log N)`: the sorting dominates, and the unions are near-constant each. DFS over a graph of emails works too.

## Follow-ups

- Accounts arrive one at a time, and the merged view must stay current after each. Which approach adapts without starting over?
- Phone numbers can link accounts too. What changes?
- Bad data: two accounts share an email but carry different names. How would you detect and report it during the merge?
