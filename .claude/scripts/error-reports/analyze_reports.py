#!/usr/bin/env python3
"""Classify DocSpace client error reports from the Firebase RTDB export.

Usage:
  python3 analyze_reports.py EXPORT.json [--target 4.0.0] [--baseline 3.7.0,3.7.1]
                             [--out DIR] [--top 40]
  python3 analyze_reports.py EXPORT.json --signature QUERY [--samples 5] [--out DIR]

Overview mode writes into --out (default: docspace-error-reports/ next to the export):
  report.md        overview, categories, target-vs-baseline comparison, new signatures
  signatures.csv   every signature with per-version counts, users and portals
  target.jsonl     the target-version reports, trimmed (no localStorage)

Signature mode (--signature) resolves QUERY to one signature - exact signature,
report push id, or a case-insensitive substring/regex that matches exactly one -
and writes:
  signature-<slug>.md     versions, timeline, apps, routes, frames, browsers,
                          raw message variants, neighbouring errors, sample stacks
  signature-<slug>.jsonl  every report of that signature, trimmed
When QUERY matches several signatures it prints the candidates and exits 2.

The export contains portal hosts and user ids: keep the output outside the repo.

The report time is taken from the Firebase push id (the first 8 chars encode
milliseconds since epoch), because the reportTime field comes in several
locale-dependent formats.
"""

import argparse
import collections
import csv
import datetime as dt
import json
import os
import re
import sys
from urllib.parse import urlparse

PUSH_CHARS = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz"


def push_id_time(key):
    n = 0
    for c in key[:8]:
        n = n * 64 + PUSH_CHARS.index(c)
    return dt.datetime.fromtimestamp(n / 1000, dt.timezone.utc)


# --- normalisation -----------------------------------------------------------

UUID_RE = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", re.I)


def normalize_message(msg):
    m = (msg or "").strip().split("\n")[0]
    m = re.sub(r"https?://\S+", "<url>", m)
    m = re.sub(r"(API returned an error \[\w+) \| [^\]]*\]", r"\1]", m)
    m = UUID_RE.sub("<uuid>", m)
    m = re.sub(r"\b[0-9a-f]{8,}\b", "<hash>", m)
    m = re.sub(r"'\d+\.\d+\.\d+\.\d+'", "'<ip>'", m)
    react = re.match(r"Minified React error #(\d+)", m)
    if react:
        return f"Minified React error #{react.group(1)}"
    m = re.sub(r"\d+", "N", m)
    # Minifier-dependent identifiers: "c.at is not a function", "reading 'X'" stays.
    m = re.sub(r"^[A-Za-z_$][\w$]{0,2}\.(\w+) is not a function", r"x.\1 is not a function", m)
    m = re.sub(r"\(In '.*?'\)", "", m)
    m = re.sub(r"evaluating '[A-Za-z_$][\w$]{0,2}\.", "evaluating 'x.", m)
    m = re.sub(r'can\'t access property "(\w+)", [\w$.]+ is', r'can\'t access property "\1", x is', m)
    return m.strip()[:160] or "<empty>"


# Browser-specific wordings of the same failure, folded together.
EQUIVALENT = [
    (re.compile(r"^(Failed to execute 'removeChild'|Node\.removeChild:|The object can not be found here)"),
     "DOM: removeChild on a node that is not a child"),
    (re.compile(r"^(Failed to execute 'insertBefore'|Node\.insertBefore:)"),
     "DOM: insertBefore with a node that is not a child"),
    (re.compile(r"^Loading CSS chunk"), "Loading CSS chunk N failed."),
    (re.compile(r"^(Loading chunk|ChunkLoadError)"), "Loading chunk N failed."),
    (re.compile(r"^(Cannot read properties of null \(reading '(\w+)'\)|null is not an object \(evaluating 'x\.(\w+)'\)|can't access property \"(\w+)\", x is null)"),
     None),  # handled in fold()
]


def fold(sig):
    for rx, repl in EQUIVALENT:
        mm = rx.match(sig)
        if not mm:
            continue
        if repl is not None:
            return repl
        prop = next((g for g in mm.groups()[1:] if g), None)
        return f"null deref: .{prop}" if prop else sig
    mm = re.match(r"^(?:Cannot read properties of undefined \(reading '(\w+)'\)|undefined is not an object \(evaluating 'x\.(\w+)'\)|can't access property \"(\w+)\", x is undefined)", sig)
    if mm:
        return f"undefined deref: .{next(g for g in mm.groups() if g)}"
    return sig


# --- classification ----------------------------------------------------------

CATEGORIES = [
    ("test/noise", r"^(test|<empty>)$"),
    ("chunk-load (stale deploy / network)", r"Loading (CSS )?chunk|ChunkLoadError|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module"),
    ("DOM mutated outside React (translate/extensions)", r"^DOM: |dead object"),
    ("backend (.NET / DB)", r"Object reference not set|Sequence contains|mysqladmin|Value cannot be null|Distributed Lock|Command Timeout|non-concurrent collections|saving the entity changes|no such module|operation has timed out|IDXN|Error in input stream"),
    ("network / transport", r"Connection closed|fetch failed|Failed to fetch|NetworkError|Network Error|timeout|Load failed|ERR_|socket"),
    ("API error response", r"API returned an error|Access denied|quota has been exceeded|requested range is not satisfiable|path/not_found|Documents Service|services de documents|servicio de documentos|Invalid arguments|An unexpected error occurred|not be loaded|não pode ser carregado|cannot be uploaded"),
    ("bad JSON / HTML instead of JSON", r"JSON|Unexpected token '<'|Unexpected end of"),
    ("browser compatibility (missing API)", r"x\.(at|findLastIndex|toSorted|replaceAll|structuredClone|attachEvent|detachEvent|flatMap|hasOwn) is not a function|Indexed property setter"),
    ("React / routing / SSR", r"Minified React error|Router|must be used within|Server Components render|Hydration|hydrat|too much recursion|Maximum update depth"),
    ("null / undefined dereference", r"^(null|undefined) deref|is undefined$|is null$|Cannot set properties of (null|undefined)|is not an object|is not a function|Reduce of empty array"),
    ("config / bootstrap", r"ClientConfig|enableLogs|viewAccessibility|ImageView|WebRestrictedEditing"),
]
CATEGORIES = [(n, re.compile(p, re.I)) for n, p in CATEGORIES]


def classify(sig):
    for name, rx in CATEGORIES:
        if rx.search(sig):
            return name
    return "other"


# --- report context ----------------------------------------------------------

def browser_of(ua):
    ua = ua or ""
    for name, rx in [
        ("DesktopEditors", r"AscDesktopEditor/([\d.]+)"),
        ("Edge", r"Edg/(\d+)"),
        ("Opera", r"OPR/(\d+)"),
        ("Samsung", r"SamsungBrowser/(\d+)"),
        ("Firefox", r"Firefox/(\d+)"),
        ("Chrome", r"Chrome/(\d+)"),
        ("Safari", r"Version/(\d+[.\d]*) .*Safari"),
    ]:
        mm = re.search(rx, ua)
        if mm:
            return name, mm.group(1)
    return "other", ""


def app_of(rec):
    path = urlparse(rec.get("errorUrl") or "").path
    stack = rec.get("errorStack") or ""
    for app in ("doceditor", "login", "management", "sdk"):
        if path.startswith(f"/{app}") or f"/{app}/_next/" in stack:
            return app
    return "client"


def route_of(rec):
    u = rec.get("errorUrl")
    if not u:
        return ""
    path = urlparse(u).path
    path = UUID_RE.sub(":uuid", path)
    path = re.sub(r"/\d+", "/:id", path)
    return path[:80]


def top_frame(stack):
    """First frame from our own bundles, with chunk hashes removed."""
    # Chrome frames are "at fn (url:line:col)", Firefox/Safari "fn@url:line:col"
    # with no header line; requiring ":line" skips "(missing: url.js)" in messages.
    for line in (stack or "").split("\n"):
        if re.search(r"(moz|chrome|safari)-extension://", line):
            return "<extension>"
        mm = re.search(r"https?://[^/\s]+(/[^\s()]+?\.js):\d+", line)
        if not mm:
            continue
        f = mm.group(1)
        f = re.sub(r"[.-][0-9a-f]{8,}(?=\.js)", "", f)
        f = re.sub(r"/\d+(?=\.js)", "/<chunk>", f)
        return f
    return ""


def norm_version(v):
    return (v or "unknown").lstrip("v") or "unknown"


def vkey(v):
    try:
        return tuple(int(x) for x in v.split("."))
    except ValueError:
        return (0,)


# --- loading -----------------------------------------------------------------

def load_rows(path):
    with open(path, encoding="utf-8") as fh:
        reports = json.load(fh)["reports"]
    rows = []
    for key, rec in reports.items():
        sig = fold(normalize_message(rec.get("errorMessage")))
        rows.append({
            "id": key,
            "time": push_id_time(key),
            "version": norm_version(rec.get("version")),
            "sig": sig,
            "category": classify(sig),
            "user": rec.get("userId") or "",
            "portal": urlparse(rec.get("url") or "").netloc,
            "app": app_of(rec),
            "route": route_of(rec),
            "frame": top_frame(rec.get("errorStack")),
            "browser": browser_of(rec.get("userAgent")),
            "auto": (rec.get("description") or "").strip() in ("", "AUTO SEND"),
            "rec": rec,
        })
    return rows


def group(rows, key="sig"):
    out = collections.defaultdict(list)
    for r in rows:
        out[r[key]].append(r)
    return out


def first_version(rs):
    vs = [r["version"] for r in rs if r["version"] != "unknown"]
    return min(vs, key=vkey) if vs else "unknown"


def users(rs):
    return len({r["user"] for r in rs})


def portals(rs):
    return len({r["portal"] for r in rs})


def trimmed(r):
    rec = {k: v for k, v in r["rec"].items() if k != "localStorage"}
    rec.update(_id=r["id"], _time=r["time"].isoformat(), _sig=r["sig"], _category=r["category"])
    return rec


def write_jsonl(path, rs):
    with open(path, "w", encoding="utf-8") as fh:
        for r in sorted(rs, key=lambda r: r["time"]):
            fh.write(json.dumps(trimmed(r), ensure_ascii=False) + "\n")


def md(s):
    return str(s).replace("|", "/").replace("\n", " ")


# --- overview report ---------------------------------------------------------

def write_overview(rows, args):
    baseline = set(args.baseline.split(","))
    by_sig = group(rows)
    target = [r for r in rows if r["version"] == args.target]
    base = [r for r in rows if r["version"] in baseline]

    versions = sorted({r["version"] for r in rows}, key=vkey)
    with open(os.path.join(args.out, "signatures.csv"), "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["signature", "category", "total", "users", "portals", "first_version",
                    "last_seen", *versions])
        for sig, rs in sorted(by_sig.items(), key=lambda kv: -len(kv[1])):
            vc = collections.Counter(r["version"] for r in rs)
            w.writerow([sig, rs[0]["category"], len(rs), users(rs), portals(rs), first_version(rs),
                        max(r["time"] for r in rs).date().isoformat(), *[vc[v] for v in versions]])

    write_jsonl(os.path.join(args.out, "target.jsonl"), target)

    out = []
    p = out.append
    t0, t1 = min(r["time"] for r in rows), max(r["time"] for r in rows)
    p(f"# DocSpace error reports — {args.target} vs {', '.join(sorted(baseline, key=vkey))}\n")
    p(f"Export: {len(rows)} reports, {t0:%Y-%m-%d} … {t1:%Y-%m-%d}, "
      f"{len(by_sig)} distinct signatures.\n")
    if target:
        p(f"Target {args.target}: **{len(target)} reports**, {users(target)} users, "
          f"{portals(target)} portals, "
          f"{min(r['time'] for r in target):%Y-%m-%d %H:%M} … {max(r['time'] for r in target):%Y-%m-%d %H:%M} UTC.  ")
        p(f"Baseline: {len(base)} reports, {users(base)} users, {portals(base)} portals.\n")

    nt, nb = max(len(target), 1), max(len(base), 1)

    def share_table(key, title, limit=15):
        p(f"\n## {title}\n")
        p(f"| {key} | {args.target} | % | baseline | % | Δ pp |\n|---|---:|---:|---:|---:|---:|")
        val = (lambda r: r[key][0]) if key == "browser" else (lambda r: r[key])
        tc = collections.Counter(val(r) for r in target)
        bc = collections.Counter(val(r) for r in base)
        for k in sorted(set(tc) | set(bc), key=lambda k: -(tc[k] / nt + bc[k] / nb))[:limit]:
            a, b = 100 * tc[k] / nt, 100 * bc[k] / nb
            p(f"| {k or '—'} | {tc[k]} | {a:.1f} | {bc[k]} | {b:.1f} | {a - b:+.1f} |")

    share_table("category", "Categories")
    share_table("app", "Application")
    share_table("browser", "Browser")

    def sig_line(sig, rs_t, rs_b):
        allrs = by_sig[sig]
        frames = collections.Counter(r["frame"] for r in rs_t if r["frame"]).most_common(2)
        routes = collections.Counter(r["route"] for r in rs_t if r["route"]).most_common(3)
        return (f"| {md(sig)} | {allrs[0]['category']} | {len(rs_t)} | "
                f"{users(rs_t)} | {portals(rs_t)} | {len(rs_b)} | "
                f"{first_version(allrs)} | {', '.join(f for f, _ in frames)} | "
                f"{', '.join(f'{x} ({n})' for x, n in routes)} |")

    hdr = ("| signature | category | target | users | portals | baseline | first seen | top frame | routes |\n"
           "|---|---|---:|---:|---:|---:|---|---|---|")
    tsig, bsig = group(target), group(base)

    new = {s: rs for s, rs in tsig.items() if first_version(by_sig[s]) == args.target}
    p(f"\n## New in {args.target} (never reported by an earlier version)\n")
    p(hdr)
    for s, rs in sorted(new.items(), key=lambda kv: (-users(kv[1]), -len(kv[1]))):
        p(sig_line(s, rs, bsig.get(s, [])))

    grown = [(s, rs) for s, rs in tsig.items() if s not in new
             and len(rs) / nt > 1.5 * len(bsig.get(s, [])) / nb and len(rs) >= 2]
    p(f"\n## Grown in {args.target} (share ≥1.5× baseline, ≥2 reports)\n")
    p(hdr)
    for s, rs in sorted(grown, key=lambda kv: -len(kv[1])):
        p(sig_line(s, rs, bsig.get(s, [])))

    p(f"\n## Top {args.top} signatures in {args.target}\n")
    p(hdr)
    for s, rs in sorted(tsig.items(), key=lambda kv: -len(kv[1]))[:args.top]:
        p(sig_line(s, rs, bsig.get(s, [])))

    gone = sorted(((s, rs) for s, rs in bsig.items() if s not in tsig and users(rs) >= 3),
                  key=lambda kv: -len(kv[1]))[:20]
    p(f"\n## Frequent in baseline, absent from {args.target} (≥3 users) — fixed or not yet hit\n")
    p("| signature | baseline | users | last seen |\n|---|---:|---:|---|")
    for s, rs in gone:
        p(f"| {md(s)} | {len(rs)} | {users(rs)} | {max(r['time'] for r in by_sig[s]):%Y-%m-%d} |")

    manual = [r for r in target if not r["auto"]]
    if manual:
        p(f"\n## User-written descriptions ({args.target})\n")
        for r in manual:
            p(f"- `{r['sig'][:80]}` — {r['rec']['description'].strip()[:300]!r}")

    p("\n## Daily volume (last 30 days, all versions)\n")
    days = collections.Counter(r["time"].date() for r in rows if (t1 - r["time"]).days < 30)
    tdays = collections.Counter(r["time"].date() for r in target)
    p("| day | all | target |\n|---|---:|---:|")
    for day in sorted(days):
        p(f"| {day} | {days[day]} | {tdays[day]} |")

    with open(os.path.join(args.out, "report.md"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(out) + "\n")
    print(f"{len(rows)} reports, {len(by_sig)} signatures, target {len(target)}; "
          f"wrote report.md, signatures.csv, target.jsonl to {args.out}", file=sys.stderr)


# --- single-signature report -------------------------------------------------

def resolve_signature(rows, by_sig, query):
    """Return (signature, None) or (None, candidates)."""
    if query in by_sig:
        return query, None
    by_id = {r["id"]: r for r in rows}
    if query in by_id:
        return by_id[query]["sig"], None
    folded = fold(normalize_message(query))
    if folded in by_sig:
        return folded, None
    try:
        rx = re.compile(query, re.I)
        hits = [s for s in by_sig if rx.search(s)]
    except re.error:
        hits = []
    if not hits:
        q = query.lower()
        hits = [s for s in by_sig if q in s.lower()]
    if len(hits) == 1:
        return hits[0], None
    return None, sorted(hits, key=lambda s: -len(by_sig[s]))


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:60] or "empty"


def write_signature(rows, args):
    by_sig = group(rows)
    sig, candidates = resolve_signature(rows, by_sig, args.signature)
    if sig is None:
        if not candidates:
            print(f"No signature matches {args.signature!r}.", file=sys.stderr)
        else:
            print(f"{len(candidates)} signatures match {args.signature!r}; "
                  "pass the exact one (or a report id):", file=sys.stderr)
            for s in candidates[:50]:
                print(f"  {len(by_sig[s]):6}  {users(by_sig[s]):5}u  {s}", file=sys.stderr)
        sys.exit(2)

    rs = sorted(by_sig[sig], key=lambda r: r["time"])
    per_version = collections.Counter(r["version"] for r in rows)
    out = []
    p = out.append

    def top_table(title, values, limit=10):
        c = collections.Counter(v for v in values if v)
        if not c:
            return
        p(f"\n## {title}\n")
        p("| value | reports | % |\n|---|---:|---:|")
        for v, n in c.most_common(limit):
            p(f"| {md(v)} | {n} | {100 * n / len(rs):.1f} |")
        if len(c) > limit:
            p(f"| … {len(c) - limit} more | {sum(n for _, n in c.most_common()[limit:])} | |")

    p(f"# {md(sig)}\n")
    p(f"- Category: **{rs[0]['category']}**")
    p(f"- Reports: **{len(rs)}**, users: **{users(rs)}**, portals: **{portals(rs)}**")
    p(f"- First seen: {rs[0]['time']:%Y-%m-%d %H:%M} UTC ({rs[0]['version']}); "
      f"last seen: {rs[-1]['time']:%Y-%m-%d %H:%M} UTC ({rs[-1]['version']})")
    p(f"- Earliest version: {first_version(rs)}; latest version reporting it: "
      f"{max((r['version'] for r in rs), key=vkey)}")
    top_user = collections.Counter(r["user"] for r in rs).most_common(1)[0]
    if len(rs) > 1:
        p(f"- Concentration: the noisiest user sent {top_user[1]} of {len(rs)} reports "
          f"({100 * top_user[1] / len(rs):.0f}%)")

    p("\n## By version\n")
    p("| version | reports | users | portals | % of that version's reports |\n|---|---:|---:|---:|---:|")
    for v, vrs in sorted(group(rs, "version").items(), key=lambda kv: vkey(kv[0]), reverse=True):
        p(f"| {v} | {len(vrs)} | {users(vrs)} | {portals(vrs)} | {100 * len(vrs) / per_version[v]:.1f} |")

    span = (rs[-1]["time"] - rs[0]["time"]).days
    fmt, unit = ("%Y-%m-%d", "day") if span <= 60 else ("%Y-%m", "month")
    p(f"\n## Timeline (per {unit})\n")
    p(f"| {unit} | reports | users |\n|---|---:|---:|")
    for k, krs in sorted(group([dict(r, bucket=r["time"].strftime(fmt)) for r in rs], "bucket").items()):
        p(f"| {k} | {len(krs)} | {users(krs)} |")

    raw = collections.Counter((r["rec"].get("errorMessage") or "").strip().split("\n")[0][:200] for r in rs)
    p("\n## Raw message variants\n")
    for m, n in raw.most_common(8):
        p(f"- {n} × `{m}`")
    if len(raw) > 8:
        p(f"- … {len(raw) - 8} more variants")

    top_table("Application", (r["app"] for r in rs))
    top_table("Route (errorUrl)", (r["route"] for r in rs))
    top_table("Top frame", (r["frame"] for r in rs))
    top_table("Browser", (r["browser"][0] for r in rs))
    top_table("Browser version", (f"{r['browser'][0]} {r['browser'][1]}".strip() for r in rs))
    top_table("Platform", (r["rec"].get("platform") for r in rs))
    top_table("Language", (r["rec"].get("language") for r in rs))
    top_table("Portal", (r["portal"] for r in rs))

    manual = [r for r in rs if not r["auto"]]
    if manual:
        p("\n## User-written descriptions\n")
        for r in manual:
            p(f"- {r['time']:%Y-%m-%d} {r['version']} — {r['rec']['description'].strip()[:400]!r}")

    # Other errors the same user hit within five minutes: often the real cause.
    by_user = group(rows, "user")
    window = dt.timedelta(minutes=5)
    near = collections.Counter()
    for r in rs:
        seen = set()
        for o in by_user.get(r["user"], []):
            if o["sig"] != sig and abs(o["time"] - r["time"]) <= window and o["sig"] not in seen:
                seen.add(o["sig"])
                near[o["sig"]] += 1
    if near:
        p("\n## Neighbouring errors (same user, ±5 min)\n")
        p("| signature | reports with it nearby |\n|---|---:|")
        for s, n in near.most_common(10):
            p(f"| {md(s)} | {n} |")

    p(f"\n## Sample reports (newest first, one per version × frame, up to {args.samples})\n")
    picked, keys = [], set()
    for r in reversed(rs):
        k = (r["version"], r["frame"])
        if k not in keys:
            keys.add(k)
            picked.append(r)
        if len(picked) >= args.samples:
            break
    for r in picked:
        rec = r["rec"]
        p(f"### {r['id']} — {r['time']:%Y-%m-%d %H:%M} UTC, {r['version']}, {r['app']}\n")
        p(f"- errorUrl: `{rec.get('errorUrl') or rec.get('url')}`")
        p(f"- userAgent: `{rec.get('userAgent')}`")
        p(f"- message: `{(rec.get('errorMessage') or '')[:400]}`\n")
        stack = "\n".join((rec.get("errorStack") or "").split("\n")[:15])
        p("```\n" + stack + "\n```\n")

    slug = slugify(sig)
    md_path = os.path.join(args.out, f"signature-{slug}.md")
    with open(md_path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(out) + "\n")
    write_jsonl(os.path.join(args.out, f"signature-{slug}.jsonl"), rs)
    print(f"{sig!r}: {len(rs)} reports, {users(rs)} users; wrote {md_path} and .jsonl",
          file=sys.stderr)


# --- main --------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("export")
    ap.add_argument("--target", default="4.0.0")
    ap.add_argument("--baseline", default="3.7.0,3.7.1")
    ap.add_argument("--out")
    ap.add_argument("--top", type=int, default=40)
    ap.add_argument("--signature", help="write a report for one signature instead of the overview")
    ap.add_argument("--samples", type=int, default=5)
    args = ap.parse_args()
    args.out = args.out or os.path.join(os.path.dirname(os.path.abspath(args.export)),
                                        "docspace-error-reports")
    os.makedirs(args.out, exist_ok=True)

    rows = load_rows(args.export)
    if args.signature:
        write_signature(rows, args)
    else:
        write_overview(rows, args)


if __name__ == "__main__":
    main()
