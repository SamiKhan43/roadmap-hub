#!/usr/bin/env python3
"""Assemble content/roadmap.json + content/topics/*.json and build index.html.

Usage:  python scripts/build.py            # writes ./index.html
        python scripts/build.py --check   # fails if ./index.html is out of date
"""
import argparse, json, pathlib, subprocess, sys, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
REQUIRED = ("l", "i", "t", "c", "p", "s", "sc", "tb", "q", "o", "pr")


def load(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        sys.exit(f"Invalid JSON in {path.relative_to(ROOT)} (line {e.lineno}, col {e.colno}): {e.msg}")


def assemble():
    meta = load(ROOT / "content" / "roadmap.json")
    accent = meta.pop("accent", "auto")
    topics = []
    for f in sorted((ROOT / "content" / "topics").glob("*.json")):
        if f.name.startswith("_"):
            continue
        t = load(f)
        missing = [k for k in REQUIRED if k not in t]
        if missing:
            sys.exit(f"{f.relative_to(ROOT)}: missing key(s): {', '.join(missing)}")
        t["_file"] = f.name
        topics.append(t)
    if not topics:
        sys.exit("No topic files found in content/topics/")
    titles = [t["t"] for t in topics]
    dupes = {x for x in titles if titles.count(x) > 1}
    if dupes:
        sys.exit(f"Duplicate topic titles: {', '.join(sorted(dupes))}")
    topics.sort(key=lambda t: (t["l"], t["_file"]))
    for t in topics:
        t.pop("_file")
    meta["topics"] = topics
    return meta, accent


def build(out):
    meta, accent = assemble()
    with tempfile.TemporaryDirectory() as d:
        tmp = pathlib.Path(d) / "roadmap.json"
        tmp.write_text(json.dumps(meta, ensure_ascii=False), encoding="utf-8")
        subprocess.run(
            [sys.executable, str(ROOT / "scripts" / "build_roadmap.py"), str(tmp), str(out), "--accent", accent],
            check=True,
        )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="verify index.html is up to date")
    a = ap.parse_args()
    target = ROOT / "index.html"
    if a.check:
        with tempfile.TemporaryDirectory() as d:
            fresh = pathlib.Path(d) / "index.html"
            build(fresh)
            if not target.exists() or target.read_text(encoding="utf-8") != fresh.read_text(encoding="utf-8"):
                sys.exit("index.html is out of date. Run: python scripts/build.py and commit the result.")
        print("index.html is up to date.")
    else:
        build(target)


if __name__ == "__main__":
    main()
