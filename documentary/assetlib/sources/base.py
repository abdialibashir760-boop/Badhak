from __future__ import annotations

import html
import os
import re
from typing import Any, Mapping

from ..http import Http
from ..licensing import SOURCE_POLICY
from ..models import Candidate


def clean_html(s: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s or ""))).strip()


def as_list(v: Any) -> list:
    return v if isinstance(v, list) else ([] if v in (None, "") else [v])


class Source:
    name = ""
    display = ""
    media_types: tuple[str, ...] = ("image",)

    def __init__(self, http: Http, env: Mapping[str, str] | None = None):
        self.http = http
        self.env = env if env is not None else os.environ

    @property
    def policy(self) -> dict:
        return SOURCE_POLICY[self.name]

    @property
    def access(self) -> str:
        return self.policy["access"]

    def key(self) -> str:
        var = self.policy.get("env", "")
        return (self.env.get(var, "") if var else "").strip()

    def configured(self) -> bool:
        if self.access == "manual":
            return False  # nothing to call
        return self.access == "open" or bool(self.key())

    def status_line(self) -> str:
        if self.access == "manual":
            return "manual only (no API) - search link + register-manual"
        if self.access == "api-key" and not self.key():
            return f"NOT CONFIGURED - set {self.policy['env']}"
        return "ready"

    def supports(self, media_type: str) -> bool:
        return media_type in self.media_types

    def search(self, query: str, media_type: str, limit: int = 15) -> list[Candidate]:
        raise NotImplementedError

    def enrich(self, c: Candidate) -> Candidate:
        """Optional second call for finalists (rights text, file list)."""
        return c

    def download_request(self, c: Candidate) -> tuple[str, dict[str, str]]:
        return c.download_url, {}

    def search_url(self, query: str) -> str:
        """Human-facing search page used only as a *lead* for manual review (never fetched)."""
        return self.policy["docs"]
