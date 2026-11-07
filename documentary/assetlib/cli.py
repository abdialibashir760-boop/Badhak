"""Command line: python -m assetlib <command>  (run from the documentary/ folder)."""
from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

from .http import Http, HttpError
from .library import Library, probe_media, read_json, sha256_file, slugify, EXT_BY_CTYPE
from .licensing import SOURCE_POLICY, assess
from .models import Candidate, Scene
from .pipeline import Pipeline
from .report import credits_md, scene_report, validate_scenes
from .sources import build_sources

ROOT = Path(__file__).resolve().parent.parent


def load_scenes(project: str) -> list[Scene]:
    data = read_json(ROOT / "projects" / project / "scenes.json", None)
    if data is None:
        sys.exit(f"projects/{project}/scenes.json not found or invalid")
    return [Scene.from_dict(d) for d in data["scenes"]]


def make(project: str):
    http = Http(cache_dir=ROOT / ".cache" / "http")
    sources = build_sources(http)
    lib = Library(ROOT / "library" / project)
    return http, sources, lib, Pipeline(sources, lib, http)


def pick(scenes: list[Scene], ids: list[str]) -> list[Scene]:
    if not ids:
        return scenes
    by = {s.id: s for s in scenes}
    bad = [i for i in ids if i not in by]
    if bad:
        sys.exit(f"unknown scene id(s): {', '.join(bad)}")
    return [by[i] for i in ids]


def cmd_sources(a):
    _, sources, _, _ = make(a.project)
    print(f"{'source':12} {'access':8} {'status':46} licence")
    for n, s in sources.items():
        print(f"{n:12} {s.access:8} {s.status_line():46} {SOURCE_POLICY[n]['license']}")
    print("\nPer-asset licence always overrides these platform defaults. See SOURCE_POLICY in assetlib/licensing.py.")


def cmd_validate(a):
    _, sources, lib, _ = make(a.project)
    errs = validate_scenes(load_scenes(a.project), sources) + lib.validate()
    print("\n".join(errs) if errs else "scenes and library OK")
    return 1 if errs else 0


def cmd_search(a):
    _, _, lib, pipe = make(a.project)
    only = a.only.split(",") if a.only else None
    for s in pick(load_scenes(a.project), a.scenes):
        if s.asset_mode == "build":
            print(f"{s.id}: build scene (no sourcing)")
            continue
        out = pipe.search(s, only)
        pipe.evaluate(s, out)
        sel = pipe.select(s, out.candidates)
        print(f"{s.id}: {len(out.candidates)} candidates | would accept {len(sel.accepted)} | review {len(sel.review)} | rejected {len(sel.rejected)}")
        for e in out.log:
            if e["status"] not in ("ok",):
                print(f"   [{e['status']}] {e['source']}: {e.get('note') or e.get('error', '')}")
        for c in (sel.accepted + sel.review)[:5]:
            print(f"   {c.ref:28} rel={c.relevance:<5} {c.license_status:7} {c.width}x{c.height} {c.title[:60]}")


def cmd_acquire(a):
    _, _, lib, pipe = make(a.project)
    only = a.only.split(",") if a.only else None
    for s in pick(load_scenes(a.project), a.scenes):
        r = pipe.acquire(s, download=not a.dry_run, only=only)
        print(f"{s.id}: {r}")
    print("\n" + scene_report(lib, load_scenes(a.project)).split("\n\n", 2)[2].split("\n\n")[0])


def cmd_approve(a):
    """Human decision: download one reviewed candidate for a scene."""
    _, _, lib, pipe = make(a.project)
    s = pick(load_scenes(a.project), [a.scene])[0]
    data = read_json(lib.root / "candidates" / f"{s.id}.json", {})
    pool = data.get("review", []) + data.get("accepted", [])
    found = next((Candidate.from_dict(c) for c in pool if c["source"] + ":" + c["source_id"] == a.ref), None)
    if not found:
        sys.exit(f"{a.ref} is not in the review/accepted list for {s.id}; run `search`/`acquire` first")
    if found.license_status == "blocked":
        sys.exit("licence is blocked")
    ok, note = pipe.download(s, found, how=f"manual-approval: {a.note or 'reviewed by human'}")
    print("downloaded" if ok else f"failed: {note}")
    if ok:
        n = len(lib.load_map()["scenes"][s.id]["assets"])
        lib.update_scene(s.id, status="filled" if n >= s.clips_needed else "partial")
    return 0 if ok else 1


def cmd_register_manual(a):
    """Register a file a human obtained from a no-API source (Mixkit, NOAA, ...)."""
    _, _, lib, _ = make(a.project)
    s = pick(load_scenes(a.project), [a.scene])[0]
    f = Path(a.file)
    if not f.is_file():
        sys.exit(f"{f} not found")
    if not (a.url and a.creator and a.license):
        sys.exit("--url, --creator and --license are required: read them from the item page")
    c = Candidate(source=a.source, source_id=a.source_id or slugify(f.stem, 24), title=a.title or f.stem, media_type=a.type,
                  page_url=a.url, creator=a.creator, license_name=a.license, license_url=a.license_url or "",
                  rights_text=a.license, description=a.note or "")
    assess(c)
    if c.license_status == "blocked":
        sys.exit("licence text indicates it cannot be used in monetised video")
    c.relevance = 1.0
    c.relevance_notes = ["manually registered by a human who read the item page"]
    tmp = f.with_name(f".{f.name}.reg")
    shutil.copy(f, tmp)
    probed = probe_media(f, a.type)
    ext = f.suffix.lower()
    ctype = next((k for k, v in EXT_BY_CTYPE.items() if v == ext), "")
    lib.add_asset(s.id, c, tmp, {"content_type": ctype, "size": f.stat().st_size, "sha256": sha256_file(f)}, probed, how="manual-registration")
    print(f"registered {a.source}:{c.source_id} -> {s.id} (licence status: {c.license_status})")


def cmd_report(a):
    _, _, lib, _ = make(a.project)
    text = scene_report(lib, load_scenes(a.project))
    (lib.root).mkdir(parents=True, exist_ok=True)
    (lib.root / "ASSET_REPORT.md").write_text(text, "utf-8")
    print(text)


def cmd_credits(a):
    _, _, lib, _ = make(a.project)
    text = credits_md(lib)
    (lib.root / "CREDITS.md").write_text(text, "utf-8")
    print(text)


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(prog="assetlib", description=__doc__)
    ap.add_argument("--project", default="lesotho")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("sources").set_defaults(fn=cmd_sources)
    sub.add_parser("validate").set_defaults(fn=cmd_validate)
    for name, fn in (("search", cmd_search), ("acquire", cmd_acquire)):
        p = sub.add_parser(name)
        p.add_argument("scenes", nargs="*")
        p.add_argument("--only", help="comma list of sources")
        if name == "acquire":
            p.add_argument("--dry-run", action="store_true", help="search and select but download nothing")
        p.set_defaults(fn=fn)
    p = sub.add_parser("approve")
    p.add_argument("scene"); p.add_argument("ref", help="source:id from the review list"); p.add_argument("--note")
    p.set_defaults(fn=cmd_approve)
    p = sub.add_parser("register-manual")
    p.add_argument("scene"); p.add_argument("file"); p.add_argument("--source", required=True, choices=["mixkit", "noaa", "usgs", "nasa", "loc", "archive", "commons", "coverr", "pexels", "pixabay", "unsplash", "smithsonian"])
    p.add_argument("--url"); p.add_argument("--creator"); p.add_argument("--license"); p.add_argument("--license-url")
    p.add_argument("--title"); p.add_argument("--source-id"); p.add_argument("--note"); p.add_argument("--type", default="video", choices=["video", "image", "map", "film"])
    p.set_defaults(fn=cmd_register_manual)
    sub.add_parser("report").set_defaults(fn=cmd_report)
    sub.add_parser("credits").set_defaults(fn=cmd_credits)
    a = ap.parse_args(argv)
    try:
        return a.fn(a) or 0
    except HttpError as e:
        print(f"error: {e}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
