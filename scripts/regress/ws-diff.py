#!/usr/bin/env python3
"""ws-diff.py <labelA> <labelB>   (run it as: python3 -I ws-diff.py A B)

Compares two ws-check.sh runs, runs/<labelA>/ against runs/<labelB>/:

  * every screenshot (*.png) present in both: number of pixels that differ by
    more than 8 on any channel, and the bounding box of those pixels; for each
    image that differs a diff image (the picture dimmed, differing pixels in
    red, a red frame around their bounding box) goes to runs/diff-A-B/
  * screenshots present on one side only
  * results.json: every assertion whose outcome changed (or that exists on one
    side only), and scenarios present on one side only

Exit status: 0 when everything is identical, 1 otherwise, 2 for usage errors.
"""

import json
import os
import shutil
import sys

from PIL import Image, ImageChops, ImageDraw

THRESHOLD = 8  # a pixel differs when any channel differs by more than this

HERE = os.path.dirname(os.path.abspath(__file__))
RUNS = os.path.join(os.environ.get("REGRESS_OUT") or os.path.join(os.environ.get("TMPDIR") or "/tmp", "yalc-regress"), "runs")


def load(path):
    with Image.open(path) as im:
        return im.convert("RGB")


def compare_images(path_a, path_b, out_path):
    a, b = load(path_a), load(path_b)
    w, h = max(a.width, b.width), max(a.height, b.height)
    note = ""
    if a.size != b.size:
        note = f"size {a.width}x{a.height} vs {b.width}x{b.height}"
        ca = Image.new("RGB", (w, h), (0, 0, 0))
        cb = Image.new("RGB", (w, h), (255, 255, 255))
        ca.paste(a, (0, 0))
        cb.paste(b, (0, 0))
        base = cb
        a_cov = Image.new("L", (w, h), 0)
        b_cov = Image.new("L", (w, h), 0)
        a_cov.paste(255, (0, 0, a.width, a.height))
        b_cov.paste(255, (0, 0, b.width, b.height))
        only_one = ImageChops.difference(a_cov, b_cov)
        a, b = ca, cb
    else:
        base = b
        only_one = None
    d = ImageChops.difference(a, b)
    r, g, bl = d.split()
    worst = ImageChops.lighter(ImageChops.lighter(r, g), bl)
    mask = worst.point(lambda v: 255 if v > THRESHOLD else 0)
    if only_one is not None:
        mask = ImageChops.lighter(mask, only_one)
    count = mask.histogram()[255]
    bbox = mask.getbbox()
    if count:
        dim = Image.blend(base, Image.new("RGB", base.size, (255, 255, 255)), 0.65)
        red = Image.new("RGB", base.size, (255, 0, 0))
        out = Image.composite(red, dim, mask)
        if bbox:
            x0, y0, x1, y1 = bbox
            pad = 4
            ImageDraw.Draw(out).rectangle(
                [max(0, x0 - pad), max(0, y0 - pad), min(w - 1, x1 + pad), min(h - 1, y1 + pad)],
                outline=(255, 0, 0),
                width=2,
            )
        out.save(out_path)
    return count, bbox, note


def main(argv):
    if len(argv) != 3:
        print(__doc__.strip().split("\n\n")[0], file=sys.stderr)
        return 2
    la, lb = argv[1], argv[2]
    da, db = os.path.join(RUNS, la), os.path.join(RUNS, lb)
    for d in (da, db):
        if not os.path.isdir(d):
            print(f"ws-diff: no such run: {d}", file=sys.stderr)
            return 2

    out_dir = os.path.join(RUNS, f"diff-{la}-{lb}")
    shutil.rmtree(out_dir, ignore_errors=True)
    os.makedirs(out_dir)

    pngs = lambda d: {f for f in os.listdir(d) if f.endswith(".png") and os.path.isfile(os.path.join(d, f))}
    sa, sb = pngs(da), pngs(db)
    common = sorted(sa & sb)
    only_a, only_b = sorted(sa - sb), sorted(sb - sa)
    problems = 0

    print(f"ws-diff {la} vs {lb}: {len(common)} screenshots in both, {len(only_a)} only in {la}, {len(only_b)} only in {lb}")
    print()
    print("screenshots")
    width = max([len(n) for n in common] + [10])
    differing = 0
    for name in common:
        count, bbox, note = compare_images(os.path.join(da, name), os.path.join(db, name), os.path.join(out_dir, name))
        if count:
            differing += 1
            problems += 1
            x0, y0, x1, y1 = bbox
            extra = f"  [{note}]" if note else ""
            print(f"  DIFF  {name.ljust(width)}  {count:>8} px differ  bbox x={x0}..{x1 - 1} y={y0}..{y1 - 1} ({x1 - x0}x{y1 - y0}){extra}")
        else:
            print(f"  same  {name}")
    for name in only_a:
        problems += 1
        print(f"  MISSING in {lb}: {name}")
    for name in only_b:
        problems += 1
        print(f"  MISSING in {la}: {name}")
    if differing:
        print(f"\n  diff images: {out_dir}")

    # ---- assertions
    print("\nassertions")
    ra_path, rb_path = os.path.join(da, "results.json"), os.path.join(db, "results.json")
    ra = rb = None
    for label, p in ((la, ra_path), (lb, rb_path)):
        if not os.path.isfile(p):
            problems += 1
            print(f"  MISSING results.json in {label}")
    if os.path.isfile(ra_path) and os.path.isfile(rb_path):
        with open(ra_path) as f:
            ra = json.load(f)
        with open(rb_path) as f:
            rb = json.load(f)
        changed = 0
        total = 0
        for sc in sorted(set(ra) | set(rb)):
            if sc not in ra or sc not in rb:
                problems += 1
                print(f"  SCENARIO only in {la if sc in ra else lb}: {sc}")
                continue
            aa = {x["name"]: x for x in ra[sc]["assertions"]}
            bb = {x["name"]: x for x in rb[sc]["assertions"]}
            for name in list(aa) + [n for n in bb if n not in aa]:
                total += 1
                xa, xb = aa.get(name), bb.get(name)
                if xa is None or xb is None:
                    changed += 1
                    side = lb if xa is None else la
                    print(f"  CHANGED {sc}: {name!r} exists only in {side}")
                elif xa["ok"] != xb["ok"]:
                    changed += 1
                    word = lambda x: "pass" if x["ok"] else "FAIL"
                    detail = xb.get("detail") or xa.get("detail") or ""
                    print(f"  CHANGED {sc}: {name!r}: {la} {word(xa)} -> {lb} {word(xb)}" + (f"\n          {detail}" if detail else ""))
        problems += changed
        fails_a = sum(1 for s in ra.values() for x in s["assertions"] if not x["ok"])
        fails_b = sum(1 for s in rb.values() for x in s["assertions"] if not x["ok"])
        print(f"  {total} assertions compared, {changed} changed outcome ({la}: {fails_a} failing, {lb}: {fails_b} failing)")

    print()
    if problems:
        print(f"RESULT: DIFFERENT ({problems} problem{'s' if problems != 1 else ''})")
        return 1
    print("RESULT: IDENTICAL (0 differing pixels, identical assertion outcomes)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
