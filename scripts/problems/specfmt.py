"""Writes a spec.json the way every problem in the bank is formatted: the
metadata pretty-printed, each test on its own line, so a diff of a spec reads
test by test.

    import sys; sys.path.insert(0, "scripts/problems")
    from specfmt import dump
    dump(spec, "src/data/problems/two-sum/spec.json")
"""

import json

ORDER = [
    "id", "title", "difficulty", "lc", "topics", "kind", "entry", "className",
    "params", "returns", "mutates", "compare", "timeLimitMs", "starter", "tests",
]


def dump(spec, path):
    keys = [k for k in ORDER if k in spec] + [k for k in spec if k not in ORDER]
    lines = ["{"]
    for n, k in enumerate(keys):
        comma = "," if n < len(keys) - 1 else ""
        if k == "tests":
            lines.append('  "tests": [')
            tests = spec["tests"]
            for m, t in enumerate(tests):
                tc = "," if m < len(tests) - 1 else ""
                lines.append("    " + json.dumps(t, ensure_ascii=False, separators=(", ", ": ")) + tc)
            lines.append("  ]" + comma)
        else:
            lines.append("  " + json.dumps(k) + ": " + json.dumps(spec[k], ensure_ascii=False) + comma)
    lines.append("}")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
