"""Data models shared by every module."""
from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any

MEDIA_TYPES = ("video", "image", "map", "film")


@dataclass
class Candidate:
    """One search hit from one source. Nothing here is downloaded yet."""

    source: str
    source_id: str
    title: str
    media_type: str  # video | image | map | film
    page_url: str
    download_url: str = ""
    thumb_url: str = ""
    width: int = 0
    height: int = 0
    duration: float = 0.0
    creator: str = ""
    credit_line: str = ""
    license_name: str = ""
    license_url: str = ""
    rights_text: str = ""
    description: str = ""
    tags: list[str] = field(default_factory=list)
    date: str = ""
    place: str = ""
    attribution_required: bool | None = None
    extra: dict[str, Any] = field(default_factory=dict)
    # filled in by the pipeline
    query: str = ""
    license_status: str = ""  # clear | review | blocked
    license_notes: list[str] = field(default_factory=list)
    relevance: float = 0.0
    relevance_notes: list[str] = field(default_factory=list)
    flags: list[str] = field(default_factory=list)

    @property
    def ref(self) -> str:
        return f"{self.source}:{self.source_id}"

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> "Candidate":
        names = {f for f in cls.__dataclass_fields__}  # type: ignore[attr-defined]
        return cls(**{k: v for k, v in d.items() if k in names})


@dataclass
class Scene:
    id: str
    title: str
    narration: str = ""
    asset_mode: str = "stock"  # stock | build (map/graphic made from data, not sourced)
    subject: str = ""
    environment: str = ""
    period: str = ""
    mood: str = ""
    media_preference: str = "video"  # video | image | map | film
    accept_types: list[str] = field(default_factory=list)
    sources: list[str] = field(default_factory=list)
    queries: dict[str, list[str]] = field(default_factory=dict)  # "*" = every source
    must: list[list[str]] = field(default_factory=list)  # every group needs >=1 hit
    should: list[str] = field(default_factory=list)
    avoid: list[str] = field(default_factory=list)
    year_range: list[int] = field(default_factory=list)
    min_height: int = 1080
    clips_needed: int = 1
    generic_ok: bool = False  # True: a non-place-specific clip is acceptable
    ai_prompt: str = ""
    notes: str = ""
    extra: dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> "Scene":
        names = {f for f in cls.__dataclass_fields__}  # type: ignore[attr-defined]
        known = {k: v for k, v in d.items() if k in names}
        known["extra"] = {k: v for k, v in d.items() if k not in names}
        return cls(**known)

    def types_accepted(self) -> list[str]:
        return self.accept_types or [self.media_preference]

    def queries_for(self, source: str) -> list[str]:
        out = list(self.queries.get(source, [])) + list(self.queries.get("*", []))
        seen: set[str] = set()
        return [q for q in out if not (q in seen or seen.add(q))]
