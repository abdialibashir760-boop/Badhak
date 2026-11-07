"""Scene -> search -> evaluate -> select -> (download) -> map. Never substitutes silently."""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from . import licensing, scoring
from .http import Http, HttpError
from .library import EXT_BY_CTYPE, Library, fingerprint, probe_media, write_json
from .models import Candidate, Scene
from .sources.base import Source

DEFAULT_PRIORITY = {
    "video": ["pexels", "pixabay", "coverr", "commons", "archive", "nasa", "mixkit"],
    "film": ["archive", "loc", "commons", "nasa", "smithsonian"],
    "image": ["commons", "loc", "smithsonian", "archive", "usgs", "nasa", "unsplash", "pexels", "pixabay"],
    "map": ["loc", "commons", "usgs", "smithsonian", "nasa"],
}
ENRICH_TOP = 6


@dataclass
class SearchOutcome:
    candidates: list[Candidate] = field(default_factory=list)
    log: list[dict[str, Any]] = field(default_factory=list)


@dataclass
class Selection:
    accepted: list[Candidate] = field(default_factory=list)
    review: list[Candidate] = field(default_factory=list)
    rejected: list[tuple[Candidate, str]] = field(default_factory=list)


class Pipeline:
    def __init__(self, sources: dict[str, Source], lib: Library, http: Http, per_query: int = 12):
        self.sources, self.lib, self.http, self.per_query = sources, lib, http, per_query

    def priority(self, s: Scene) -> list[str]:
        return s.sources or DEFAULT_PRIORITY.get(s.media_preference, DEFAULT_PRIORITY["image"])

    # -- 1. search ------------------------------------------------------------------------
    def search(self, s: Scene, only: list[str] | None = None) -> SearchOutcome:
        out = SearchOutcome()
        seen: set[str] = set()
        for name in self.priority(s):
            if only and name not in only:
                continue
            src = self.sources.get(name)
            if src is None:
                out.log.append({"source": name, "status": "unknown-source"})
                continue
            if src.access == "manual":
                out.log.append({"source": name, "status": "manual", "note": "no API; see suggestions for a search link"})
                continue
            if not src.configured():
                out.log.append({"source": name, "status": "skipped", "note": src.status_line()})
                continue
            queries = s.queries_for(name)
            types = [t for t in s.types_accepted() if src.supports(t)]
            if not queries or not types:
                out.log.append({"source": name, "status": "skipped",
                                "note": "no query defined" if not queries else f"source does not offer {s.types_accepted()}"})
                continue
            for q in queries:
                for t in types:
                    entry = {"source": name, "query": q, "media_type": t}
                    try:
                        hits = src.search(q, t, self.per_query)
                    except HttpError as e:
                        out.log.append({**entry, "status": "error", "error": str(e)})
                        continue
                    except (KeyError, ValueError, TypeError) as e:
                        out.log.append({**entry, "status": "error", "error": f"unexpected response shape: {e!r}"})
                        continue
                    new = [h for h in hits if h.ref not in seen]
                    for h in new:
                        seen.add(h.ref)
                        h.query = q
                    out.candidates.extend(new)
                    out.log.append({**entry, "status": "ok", "hits": len(hits), "new": len(new)})
        return out

    # -- 2. evaluate ----------------------------------------------------------------------
    def evaluate(self, s: Scene, out: SearchOutcome) -> list[Candidate]:
        for c in out.candidates:
            licensing.assess(c)
            scoring.score_relevance(c, s)
        pool = sorted((c for c in out.candidates if c.license_status != "blocked" and c.relevance >= 0.5),
                      key=lambda c: -c.relevance)[:ENRICH_TOP]
        for c in pool:
            if c.extra.get("needs_enrich"):
                try:
                    self.sources[c.source].enrich(c)
                    licensing.assess(c)
                    scoring.score_relevance(c, s)
                except HttpError as e:
                    c.flags.append(f"enrich-failed: {e}")
        return out.candidates

    # -- 3. select ------------------------------------------------------------------------
    def select(self, s: Scene, cands: list[Candidate]) -> Selection:
        used = self.lib.used()
        sel = Selection()
        prio = self.priority(s)
        ranked = sorted(cands, key=lambda c: -scoring.rank_score(
            c, s, prio.index(c.source) if c.source in prio else len(prio), len(prio)))
        for c in ranked:
            why = None
            if c.license_status == "blocked":
                why = "licence blocked: " + "; ".join(c.license_notes[:1])
            elif c.ref in used["refs"] and used["refs"][c.ref] != s.id:
                why = f"already used in scene {used['refs'][c.ref]}"
            elif fingerprint(c) in used["prints"] and used["prints"][fingerprint(c)] != s.id and c.duration:
                why = f"looks like a re-upload of footage used in scene {used['prints'][fingerprint(c)]}"
            elif c.media_type not in s.types_accepted():
                why = f"media type {c.media_type} not accepted for this scene"
            elif scoring.meets_min_height(c, s) is False:
                why = f"resolution {c.width}x{c.height} below scene minimum {s.min_height}p"
            elif "possible-watermark" in c.flags:
                why = "metadata suggests a watermark"
            elif "period-mismatch" in c.flags:
                why = "date outside the required historical period"
            elif c.relevance < 0.5:
                why = f"low relevance ({c.relevance})"
            if why:
                sel.rejected.append((c, why))
                continue
            full_match = c.relevance >= 0.999 or (not s.must and s.generic_ok)
            sure = (c.license_status == "clear" and full_match and scoring.meets_min_height(c, s) is True
                    and "period-unverified" not in c.flags)
            (sel.accepted if sure and len(sel.accepted) < s.clips_needed else sel.review).append(c)
        # keep the extra "sure" ones available as review options
        return sel

    # -- 4. suggestions -------------------------------------------------------------------
    def suggestions(self, s: Scene, out: SearchOutcome) -> list[str]:
        tips: list[str] = []
        for e in out.log:
            if e["status"] == "skipped" and "NOT CONFIGURED" in e.get("note", ""):
                tips.append(f"{e['source']}: {e['note']} then re-run to search it.")
            if e["status"] == "error":
                tips.append(f"{e['source']} query {e.get('query')!r} failed ({e['error']}); retry later or check connectivity.")
        q = (s.queries_for("*") or [q for qs in s.queries.values() for q in qs] or [s.title])[0]
        for name in ("mixkit", "noaa", "commons", "loc", "archive", "nasa", "usgs", "smithsonian"):
            src = self.sources.get(name)
            if src and (name in ("mixkit", "noaa") or name in self.priority(s)):
                tips.append(f"Human lead (not fetched): {src.display} -> {src.search_url(q)}")
        if s.must:
            tips.append("Broaden: relax one `must` group or add synonyms/local place names; "
                        "avoid accepting a generic clip for a place-specific line.")
        if s.year_range:
            tips.append(f"Historical scene ({s.year_range[0]}-{s.year_range[1]}): prefer LOC, Internet Archive, "
                        "Smithsonian and Commons scans; use an engraving/silhouette treatment instead of an invented photo.")
        tips.append("Commission or shoot new material, or license a stock clip with a verifiable location.")
        if s.ai_prompt:
            tips.append("Last resort only: AI-generated illustration from the scene's `ai_prompt`; label it as AI, "
                        "never as authentic footage, and use YouTube's altered/synthetic content disclosure if realistic.")
        return tips

    # -- 5. acquire -----------------------------------------------------------------------
    def acquire(self, s: Scene, *, download: bool = True, only: list[str] | None = None) -> dict[str, Any]:
        if s.asset_mode == "build":
            self.lib.update_scene(s.id, status="build", title=s.title,
                                  note="Map/graphic scene: built from boundary data, not sourced from stock.",
                                  spec=s.extra.get("spec_ref", ""))
            return {"status": "build"}
        out = self.search(s, only)
        self.evaluate(s, out)
        sel = self.select(s, out.candidates)
        write_json(self.lib.root / "candidates" / f"{s.id}.json", {
            "scene": s.id, "log": out.log,
            "accepted": [c.to_dict() for c in sel.accepted], "review": [c.to_dict() for c in sel.review],
            "rejected": [{"why": w, **c.to_dict()} for c, w in sel.rejected]})
        got: list[str] = []
        failures: list[str] = []
        pool = list(sel.accepted)
        if download:
            for c in pool:
                if len(got) >= s.clips_needed:
                    break
                ok, note = self.download(s, c, how="auto")
                (got if ok else failures).append(c.ref if ok else f"{c.ref}: {note}")
        have = len(self.lib.load_map()["scenes"].get(s.id, {}).get("assets", [])) if download else 0
        if not download:
            status = "would-fill" if len(sel.accepted) >= s.clips_needed else "would-be-incomplete"
        elif have >= s.clips_needed:
            status = "filled"
        elif have:
            status = "partial"
        else:
            status = "needs_review" if sel.review else "unfilled"
        if download and status in ("partial", "unfilled") and sel.review:
            status = "partial" if have else "needs_review"
        self.lib.update_scene(
            s.id, status=status, title=s.title, search_log=out.log, download_failures=failures,
            review=[{"ref": c.ref, "title": c.title, "relevance": c.relevance, "license_status": c.license_status,
                     "why_review": c.license_notes[:1] + c.relevance_notes[:2], "url": c.page_url} for c in sel.review[:8]],
            suggestions=self.suggestions(s, out) if status != "filled" else [],
            ai_fallback=({"allowed_as_last_resort": True, "prompt": s.ai_prompt, "label": "AI-generated"}
                         if status in ("unfilled",) and s.ai_prompt else None))
        return {"status": status, "accepted": len(sel.accepted), "review": len(sel.review), "rejected": len(sel.rejected)}

    def download(self, s: Scene, c: Candidate, *, how: str, role: str = "primary") -> tuple[bool, str]:
        src = self.sources[c.source]
        tmp = self.lib.root / s.id / f".{c.source}-{c.source_id[:12]}.part"
        try:
            url, headers = src.download_request(c)
            if not url:
                return False, "no download URL in record"
            dl = self.http.download(url, tmp, headers)
        except HttpError as e:
            return False, str(e)
        ctype = dl["content_type"]
        if ctype.startswith("text/") or ctype in ("application/json", "application/xml"):
            tmp.unlink(missing_ok=True)
            return False, f"server returned {ctype}, not media (likely a landing/login page)"
        if dl["sha256"] in self.lib.used()["hashes"]:
            tmp.unlink(missing_ok=True)
            return False, "identical file already in library"
        # give the temp file a real extension so header parsing / ffprobe can identify the format
        ext = EXT_BY_CTYPE.get(ctype) or Path(c.download_url.split("?")[0]).suffix.lower() or ".bin"
        typed = tmp.with_name(tmp.stem.lstrip(".") + ".dl" + ext)
        tmp.replace(typed)
        tmp = typed
        probed = probe_media(tmp, c.media_type)
        if probed.get("verified"):
            c.width, c.height = probed["width"], probed["height"]
            if scoring.meets_min_height(c, s) is False and how == "auto":
                tmp.unlink(missing_ok=True)
                return False, f"downloaded file is {c.width}x{c.height}, below scene minimum {s.min_height}p"
        self.lib.add_asset(s.id, c, tmp, dl, probed, how=how, query=c.query, role=role)
        return True, "ok"

