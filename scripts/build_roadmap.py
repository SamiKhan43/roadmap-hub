#!/usr/bin/env python3
"""Build a single-file interactive roadmap (index.html) from a roadmap JSON file.

Usage: python build_roadmap.py roadmap.json index.html [--accent auto|name|#hex]
"""
import argparse, hashlib, html, json, os, re, sys

PALETTES = {
    "emerald": "#34d399", "sky": "#38bdf8", "violet": "#a78bfa", "amber": "#fbbf24",
    "rose": "#fb7185", "cyan": "#22d3ee", "orange": "#fb923c", "fuchsia": "#e879f9",
    "lime": "#a3e635", "indigo": "#818cf8", "teal": "#2dd4bf", "blue": "#60a5fa",
}
# Stable defaults so the same topic always gets the same colour.
PRESETS = {"sql": "emerald", "fastapi": "cyan", "auth": "violet", "security": "violet",
           "docker": "blue", "postgres": "sky", "git": "orange", "python": "amber", "react": "indigo",
           "redis": "rose", "kubernetes": "teal", "javascript": "amber", "linux": "lime",
           "api": "fuchsia"}

def pick_accent(arg, slug):
    if arg and arg != "auto":
        if arg.startswith("#") and re.fullmatch(r"#[0-9a-fA-F]{6}", arg): return arg, "custom"
        if arg in PALETTES: return PALETTES[arg], arg
        sys.exit(f"Unknown accent '{arg}'. Use one of {', '.join(PALETTES)} or a #rrggbb hex.")
    for key, name in PRESETS.items():
        if key in slug.lower(): return PALETTES[name], name
    pool = [n for n in PALETTES if n != "emerald"]  # emerald is reserved for SQL
    name = pool[int(hashlib.md5(slug.encode()).hexdigest(), 16) % len(pool)]
    return PALETTES[name], name

def validate(r):
    err = []
    for k in ("slug", "title", "short", "sub", "eyebrow", "heroTitle", "heroText", "footnote", "levels", "topics", "milestones"):
        if k not in r: err.append(f"missing top-level key: {k}")
    if err: sys.exit("\n".join(err))
    n = len(r["levels"])
    for i, L in enumerate(r["levels"]):
        for k in ("name", "goal", "icon", "project"):
            if k not in L: err.append(f"level {i+1}: missing {k}")
        for k in ("t", "ic", "brief", "steps", "skills", "out"):
            if k not in L.get("project", {}): err.append(f"level {i+1} project: missing {k}")
    used = set()
    for i, t in enumerate(r["topics"]):
        for k in ("l", "i", "t", "c", "p", "s", "sc", "tb", "q", "o", "pr"):
            if k not in t: err.append(f"topic {i+1} ({t.get('t','?')}): missing {k}")
        if t.get("l") is not None: used.add(t["l"])
        if not (0 <= t.get("l", -1) < n): err.append(f"topic {i+1}: level index out of range")
        o = t.get("o", {})
        if not ("text" in o or ("c" in o and "r" in o)): err.append(f"topic {i+1}: o needs text or c+r")
        if len(t.get("pr", [])) != 3: err.append(f"topic {i+1}: pr must be [question, hint, solution]")
        for k in t.get("tb", []):
            if isinstance(k, str) and k not in r.get("tables", {}): err.append(f"topic {i+1}: unknown table '{k}'")
    for li in range(n):
        if li not in used: err.append(f"level {li+1} has no topics")
    if err: sys.exit("Validation failed:\n- " + "\n- ".join(err))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("roadmap"); ap.add_argument("out"); ap.add_argument("--accent", default="auto"); ap.add_argument("--hub", default="", help="relative link back to a hub page, e.g. ../")
    a = ap.parse_args()
    r = json.load(open(a.roadmap, encoding="utf-8"))
    validate(r)
    if a.hub: r["hub"] = a.hub
    hexc, name = pick_accent(a.accent, r["slug"])
    rgb = ",".join(str(int(hexc[i:i+2], 16)) for i in (1, 3, 5))
    tpl = open(os.path.join(os.path.dirname(__file__), "..", "assets", "template.html"), encoding="utf-8").read()
    data = json.dumps(r, ensure_ascii=False).replace("</", "<\\/")
    esc = html.escape
    out = (tpl.replace("__ACCENT__", hexc).replace("__RGB__", rgb)
           .replace("__TITLE__", esc(r["title"])).replace("__SHORT__", esc(r["short"])).replace("__SUB__", esc(r["sub"]))
           .replace("__EYEBROW__", esc(r["eyebrow"])).replace("__HERO_TITLE__", esc(r["heroTitle"]))
           .replace("__HERO_TEXT__", r["heroText"]).replace("__FOOTNOTE__", esc(r["footnote"])).replace("__ROADMAP_JSON__", data))
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    open(a.out, "w", encoding="utf-8").write(out)
    print(f"Built {a.out}: {len(r['levels'])} levels, {len(r['topics'])} topics, accent {name} ({hexc}), {len(out)//1024} KB")

if __name__ == "__main__":
    main()
