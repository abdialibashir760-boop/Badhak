"""Polite HTTP: identified User-Agent, per-host throttle, retry/backoff, disk cache.

Secrets (API keys in query strings) are never written to the cache key, logs or errors.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, Callable

SECRET_PARAMS = {"key", "api_key", "client_id", "access_key", "token"}
RETRY_STATUS = {429, 500, 502, 503, 504}
HOST_INTERVAL = {"commons.wikimedia.org": 2.0, "www.loc.gov": 3.0, "archive.org": 1.0}


class HttpError(Exception):
    def __init__(self, status: int, url: str, message: str = ""):
        super().__init__(f"HTTP {status} for {redact(url)} {message}".strip())
        self.status = status
        self.url = redact(url)


def redact(url: str) -> str:
    return re.sub(r"(?i)([?&](?:%s)=)[^&]+" % "|".join(SECRET_PARAMS), r"\1***", url)


def _default_agent() -> str:
    contact = os.environ.get("ASSETLIB_CONTACT", "").strip()
    base = "DocumentaryAssetLibrary/0.1 (research tool; official APIs only"
    return base + (f"; contact: {contact})" if contact else ")")


class Http:
    def __init__(
        self,
        user_agent: str | None = None,
        cache_dir: Path | None = None,
        ttl: int = 86400,
        max_retries: int = 4,
        sleep: Callable[[float], None] = time.sleep,
    ):
        self.user_agent = user_agent or os.environ.get("ASSETLIB_USER_AGENT") or _default_agent()
        self.cache_dir = cache_dir
        self.ttl = ttl
        self.max_retries = max_retries
        self._sleep = sleep
        self._last: dict[str, float] = {}

    # -- helpers -----------------------------------------------------------
    def _throttle(self, url: str) -> None:
        host = urllib.parse.urlparse(url).netloc
        gap = HOST_INTERVAL.get(host, 0.5)
        wait = self._last.get(host, 0) + gap - time.monotonic()
        if wait > 0:
            self._sleep(wait)
        self._last[host] = time.monotonic()

    def _cache_path(self, url: str) -> Path | None:
        if not self.cache_dir:
            return None
        p = urllib.parse.urlparse(url)
        q = sorted((k, v) for k, v in urllib.parse.parse_qsl(p.query) if k.lower() not in SECRET_PARAMS)
        raw = f"{p.netloc}{p.path}?{urllib.parse.urlencode(q)}"
        return self.cache_dir / (hashlib.sha256(raw.encode()).hexdigest() + ".json")

    def _open(self, url: str, headers: dict[str, str] | None):
        hdr = {"User-Agent": self.user_agent, "Accept": "*/*"}
        hdr.update(headers or {})
        delay = 2.0
        for attempt in range(self.max_retries + 1):
            self._throttle(url)
            try:
                return urllib.request.urlopen(urllib.request.Request(url, headers=hdr), timeout=60)
            except urllib.error.HTTPError as e:
                if e.code in RETRY_STATUS and attempt < self.max_retries:
                    ra = e.headers.get("Retry-After", "") if e.headers else ""
                    self._sleep(min(float(ra), 60) if ra.isdigit() else delay)
                    delay *= 2
                    continue
                raise HttpError(e.code, url) from None
            except (urllib.error.URLError, TimeoutError) as e:
                if attempt < self.max_retries:
                    self._sleep(delay)
                    delay *= 2
                    continue
                raise HttpError(0, url, f"network error: {getattr(e, 'reason', e)}") from None
        raise HttpError(0, url, "retries exhausted")

    # -- public ------------------------------------------------------------
    def get_json(self, url: str, params: dict[str, Any] | None = None,
                 headers: dict[str, str] | None = None, use_cache: bool = True) -> Any:
        if params:
            url += ("&" if "?" in url else "?") + urllib.parse.urlencode(params, doseq=True)
        cp = self._cache_path(url) if use_cache else None
        if cp and cp.exists() and time.time() - cp.stat().st_mtime < self.ttl:
            return json.loads(cp.read_text("utf-8"))
        with self._open(url, {"Accept": "application/json", **(headers or {})}) as r:
            body = r.read()
        try:
            data = json.loads(body.decode("utf-8"))
        except ValueError:
            raise HttpError(200, url, "response was not JSON") from None
        if cp:
            cp.parent.mkdir(parents=True, exist_ok=True)
            cp.write_text(json.dumps(data), "utf-8")
        return data

    def download(self, url: str, dest: Path, headers: dict[str, str] | None = None,
                 max_bytes: int = 500 * 1024 * 1024) -> dict[str, Any]:
        """Stream to `dest`; returns content_type, size, sha256. Removes partial files."""
        dest.parent.mkdir(parents=True, exist_ok=True)
        h = hashlib.sha256()
        size = 0
        try:
            with self._open(url, headers) as r, open(dest, "wb") as f:
                ctype = (r.headers.get("Content-Type") or "").split(";")[0].strip().lower()
                declared = int(r.headers.get("Content-Length") or 0)
                if declared and declared > max_bytes:
                    raise HttpError(200, url, f"file is {declared} bytes, over the {max_bytes} cap")
                while chunk := r.read(1 << 20):
                    size += len(chunk)
                    if size > max_bytes:
                        raise HttpError(200, url, f"over the {max_bytes} byte cap")
                    h.update(chunk)
                    f.write(chunk)
        except BaseException:
            dest.unlink(missing_ok=True)
            raise
        return {"content_type": ctype, "size": size, "sha256": h.hexdigest()}
