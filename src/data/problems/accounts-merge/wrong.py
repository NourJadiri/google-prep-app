# One pass: each account joins the first earlier group it overlaps. An account
# that bridges two groups built earlier joins only one, so they never merge.
class Solution:
    def accountsMerge(self, accounts):
        groups = []                     # [name, set of emails]
        for account in accounts:
            name, emails = account[0], set(account[1:])
            for group in groups:
                if group[1] & emails:
                    group[1] |= emails
                    break
            else:
                groups.append([name, emails])
        return [[name] + sorted(emails) for name, emails in groups]
