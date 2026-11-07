"""Relevance and quality scoring. Metadata-only: it cannot see pixels, so it never claims to."""
from __future__ import annotations

import re
import unicodedata

from .models import Candidate, Scene

WATERMARK_WORDS = ("shutterstock", "istock", "alamy", "getty", "depositphotos", "watermark", "preview only",
                   "dreamstime", "adobe stock", "123rf")


def norm(text: str) -> str:
    t = unicodedata.normalize("NFKD", text or "")
    t = "".join(ch for ch in t if not unicodedata.combining(ch)).lower()
    return re.sub(r"[^a-z0-9]+", " ", t).strip()


def haystack(c: Candidate) -> str:
    slug = c.page_url.rsplit("/", 2)[-2] if c.page_url.count("/") > 3 else ""
    return " " + norm(" ".join([c.title, c.description, " ".join(c.tags), c.place, slug, c.credit_line])) + " "


def hit(term: str, hay: str) -> bool:
    n = norm(term)
    return bool(n) and f" {n} " in hay or (len(n) >= 5 and f" {n}" in hay)  # allow plural/suffix on longer terms


def year_of(date: str) -> int | None:
    m = re.search(r"(1[0-9]{3}|20[0-9]{2})", date or "")
    return int(m.group(1)) if m else None


def score_relevance(c: Candidate, s: Scene) -> Candidate:
    hay = haystack(c)
    notes: list[str] = []
    groups = s.must
    matched = 0
    for g in groups:
        found = [t for t in g if hit(t, hay)]
        if found:
            matched += 1
            notes.append(f"matched {found[0]!r}")
        else:
            notes.append(f"missing one of {g}")
    base = matched / len(groups) if groups else 0.5
    bonus = min(0.2, 0.05 * sum(hit(t, hay) for t in s.should))
    pen = 0.3 * sum(hit(t, hay) for t in s.avoid)
    if pen:
        notes.append("avoid-terms present")
    rel = max(0.0, min(1.0, base + (bonus if base >= 1 else bonus / 2) - pen))
    if s.year_range and (y := year_of(c.date)):
        lo, hi = s.year_range
        if lo <= y <= hi:
            notes.append(f"date {y} within {lo}-{hi}")
        else:
            rel = min(rel, 0.4)
            notes.append(f"date {y} outside required {lo}-{hi}")
            c.flags.append("period-mismatch")
    elif s.year_range:
        c.flags.append("period-unverified")
        rel = min(rel, 0.8)
        notes.append("no usable date in metadata; period unverified")
    c.relevance, c.relevance_notes = round(rel, 3), notes
    blob = norm(" ".join([c.title, c.description, c.credit_line, c.download_url]))
    if any(norm(w) in blob for w in WATERMARK_WORDS):
        c.flags.append("possible-watermark")
    c.flags.append("watermark-unchecked-visually")
    return c


def quality_tier(c: Candidate) -> str:
    h = max(c.height, 0)
    w = max(c.width, 0)
    long_side = max(h, w) if c.media_type != "video" else h
    if not (h or w):
        return "unknown"
    if c.media_type == "video":
        return "4K" if h >= 2160 else "HD" if h >= 1080 else "720p" if h >= 720 else "SD"
    return "4K" if long_side >= 3840 else "HD" if long_side >= 1920 else "720p" if long_side >= 1280 else "SD"


def quality_score(c: Candidate) -> float:
    return {"4K": 1.0, "HD": 0.85, "720p": 0.4, "SD": 0.1, "unknown": 0.3}[quality_tier(c)]


def meets_min_height(c: Candidate, s: Scene) -> bool | None:
    """True/False when known, None when the source did not report a size."""
    if not (c.width or c.height):
        return None
    if c.media_type == "video":
        return c.height >= s.min_height
    return max(c.width, c.height) >= round(s.min_height * 16 / 9)


def rank_score(c: Candidate, s: Scene, priority: int, n_sources: int) -> float:
    motion = 0.0 if s.media_preference != "video" else (1.0 if c.media_type == "video" else 0.0)
    prio = 1 - priority / max(n_sources, 1)
    return round(0.6 * c.relevance + 0.2 * quality_score(c) + 0.1 * motion + 0.1 * prio, 4)
