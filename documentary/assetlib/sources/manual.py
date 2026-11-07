"""Sources with no supported API (Mixkit, NOAA). We never scrape them: the system produces a
search link for a human, and `register-manual` records the file the human chose together with
the licence they verified on the item page."""
from __future__ import annotations

from urllib.parse import quote_plus

from ..models import Candidate
from .base import Source


class _Manual(Source):
    def search(self, query, media_type, limit=15) -> list[Candidate]:
        return []


class Mixkit(_Manual):
    name, display = "mixkit", "Mixkit"
    media_types = ("video",)

    def search_url(self, q):
        return f"https://mixkit.co/free-stock-video/{quote_plus(q.replace(' ', '-').lower())}/"


class Noaa(_Manual):
    name, display = "noaa", "NOAA"
    media_types = ("image", "video")

    def search_url(self, q):
        return f"https://photolib.noaa.gov/Search?q={quote_plus(q)}"
