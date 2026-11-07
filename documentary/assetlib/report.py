from __future__ import annotations

from pathlib import Path

from .library import Library, now, read_json
from .models import Scene

ICON = {"filled": "OK", "build": "BUILD", "partial": "PARTIAL", "needs_review": "REVIEW", "unfilled": "MISSING",
        "would-fill": "DRY-OK", "would-be-incomplete": "DRY-GAP", "pending": "-"}


def validate_scenes(scenes: list[Scene], sources: dict) -> list[str]:
    errs, ids = [], set()
    for s in scenes:
        if s.id in ids:
            errs.append(f"{s.id}: duplicate scene id")
        ids.add(s.id)
        if s.asset_mode == "build":
            if not s.extra.get("spec_ref"):
                errs.append(f"{s.id}: build scene needs spec_ref")
            continue
        if not s.queries_for("*") and not any(s.queries.values()):
            errs.append(f"{s.id}: no search queries")
        if not s.must and not s.generic_ok:
            errs.append(f"{s.id}: place/subject-specific scene needs `must` terms (or set generic_ok)")
        for n in s.sources:
            if n not in sources:
                errs.append(f"{s.id}: unknown source {n!r}")
        if s.media_preference not in ("video", "image", "map", "film"):
            errs.append(f"{s.id}: bad media_preference {s.media_preference!r}")
    return errs


def scene_report(lib: Library, scenes: list[Scene]) -> str:
    m = lib.load_map()["scenes"]
    lines = ["# Asset report", "", f"_Generated {now()}_", "",
             "| Scene | Status | Assets | Needed | Title |", "|---|---|---|---|---|"]
    counts: dict[str, int] = {}
    for s in scenes:
        e = m.get(s.id, {})
        st = e.get("status", "pending")
        counts[st] = counts.get(st, 0) + 1
        n = len(e.get("assets", []))
        lines.append(f"| {s.id} | {ICON.get(st, st)} | {n} | {s.clips_needed if s.asset_mode != 'build' else '-'} | {s.title} |")
    lines += ["", "Totals: " + ", ".join(f"{ICON.get(k, k)}={v}" for k, v in sorted(counts.items())), ""]
    for s in scenes:
        e = m.get(s.id, {})
        if e.get("status") in (None, "filled", "build"):
            continue
        lines += [f"## {s.id} - {s.title}  [{ICON.get(e.get('status'), e.get('status'))}]", ""]
        lines.append(f"Needs: {s.subject or s.title}" + (f" ({s.period})" if s.period else ""))
        for r in e.get("review", []):
            lines.append(f"- review: `{r['ref']}` {r['title'][:70]!r} relevance={r['relevance']} licence={r['license_status']} "
                         f"- {'; '.join(r['why_review'])[:140]} {r['url']}")
        for t in e.get("suggestions", []):
            lines.append(f"- suggest: {t}")
        if e.get("ai_fallback"):
            lines.append(f"- AI fallback (labelled, last resort): {e['ai_fallback']['prompt'][:200]}")
        lines.append("")
    return "\n".join(lines)


def credits_md(lib: Library) -> str:
    rows = ["# Credits (generated from asset metadata)", "",
            "Paste the *required* block into the video description. Items marked 'courtesy' do not require credit "
            "but record where the material came from.", ""]
    req, cour = [], []
    for p, d in lib.sidecars():
        lic = d["license"]
        line = f"- Scene {d['scene_id']}: {lic['attribution_text']}"
        (req if lic.get("attribution_required") else cour).append(line)
    rows += ["## Required attribution", *(req or ["- (none)"]), "", "## Courtesy / provenance", *(cour or ["- (none)"])]
    unconfirmed = [d["provenance"]["ref"] for _, d in lib.sidecars() if d["license"]["status"] != "clear"]
    if unconfirmed:
        rows += ["", "## NOT cleared for monetised use yet", *[f"- {r}" for r in unconfirmed]]
    return "\n".join(rows) + "\n"
