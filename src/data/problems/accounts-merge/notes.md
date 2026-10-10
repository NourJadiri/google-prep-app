## Approach

Treat each account as a node, and draw an edge between two accounts whenever they share an email. A person is then a **connected component**, and the task is to list every component's emails. Checking every pair of accounts for overlap would build that graph in `O(n^2)` set intersections, but there's no need to. An email seen for a second time *is* an edge, back to the account that had it first.

So run **union-find over account indices**. Keep `owner`, a map from each email to the first account seen holding it. For each email of account `i`, either it's new (record `owner[email] = i`) or it's already owned, so union `i` with its owner. One pass over all the emails builds every edge that matters. A bridge account (Example 2) simply unions two groups that were separate until then, and nothing has to be revisited.

To output, walk `owner`: each distinct email appears there exactly once, which removes duplicates for free. Append each email to the list of its root account. Every root's list, sorted and placed after the root account's name, is one merged account. The name of any account in the group works, since all of them match.

Why it's right: an email links exactly the accounts that hold it, and unioning each holder with the first holder joins all of them. Union-find then closes those links transitively, so two accounts end up with the same root exactly when a chain of shared emails connects them, which is the definition of "same person".

The DFS alternative builds a graph of emails instead: link each account's first email to the others in that account, then flood from every unvisited email to collect one person's emails. Same complexity, but more code and a recursion as deep as the longest chain of emails.

## Complexity

With `n` accounts and `N` emails in total (at most `9n`): the union pass is `O(N α(n))`, which is effectively linear. Grouping is `O(N)`, and sorting the groups is `O(N log N)` overall, which dominates. Space is `O(N)` for the map and the groups.

## Pitfalls

- Merging by name. Two people can share a name, and only shared emails link accounts.
- A single greedy pass that drops each account into the first earlier group it overlaps. A later account can overlap two groups built before it (Example 2), and those groups must merge.
- Duplicates. The same email can sit on several accounts, or twice on one, so collect distinct emails before sorting.
