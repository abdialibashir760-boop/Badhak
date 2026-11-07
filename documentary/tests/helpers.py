import json
import struct
import zlib
from pathlib import Path

FIX = Path(__file__).parent / "fixtures"


def fixture(name):
    return json.loads((FIX / name).read_text("utf-8"))


def png_bytes(w, h):
    def chunk(t, d):
        c = struct.pack(">I", len(d)) + t + d
        return c + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 0, 0, 0, 0)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(b"\x00")) + chunk(b"IEND", b"")


class FakeHttp:
    """Maps URL prefixes -> JSON; records every call; serves bytes for downloads."""

    def __init__(self, routes=None, files=None):
        self.routes, self.files, self.calls, self.downloads = routes or {}, files or {}, [], []

    def get_json(self, url, params=None, headers=None, use_cache=True):
        self.calls.append((url, params))
        for prefix, payload in self.routes.items():
            if url.startswith(prefix):
                if isinstance(payload, Exception):
                    raise payload
                return payload
        raise AssertionError(f"unexpected request {url}")

    def download(self, url, dest, headers=None, max_bytes=0):
        import hashlib
        self.downloads.append(url)
        body, ctype = self.files[url]
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(body)
        return {"content_type": ctype, "size": len(body), "sha256": hashlib.sha256(body).hexdigest()}
