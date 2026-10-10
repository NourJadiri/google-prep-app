# Most tests carry their expected answers. The two big ones carry null and are
# checked against a ranking worked out here, so the spec doesn't have to store
# ten thousand labels apiece.

MEDALS = ("Gold Medal", "Silver Medal", "Bronze Medal")


def ranks(score):
    order = sorted(range(len(score)), key=lambda i: -score[i])
    labels = [None] * len(score)
    for place, i in enumerate(order, 1):
        labels[i] = MEDALS[place - 1] if place <= 3 else str(place)
    return labels


def check(got, expected, args):
    score = args[0]
    if expected is None:
        expected = ranks(score)
    if same(got, expected):
        return True
    if not isinstance(got, list) or len(got) != len(expected):
        return False
    for i, (g, e) in enumerate(zip(got, expected)):
        if not same(g, e):
            return ("Athlete " + str(i) + " (score " + str(score[i]) + ") should be "
                    + show(e) + ", got " + show(g) + ".")
    return False
