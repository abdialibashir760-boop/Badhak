"""On-disk asset library: descriptive filenames, one metadata sidecar per asset, scene map.

    library/<project>/<scene_id>/<scene>_<slug>_<source>-<id>.<ext>
    library/<project>/<scene_id>/<same name>.<ext>.json     <- metadata sidecar
    library/<project>/scene_map.json                         <- scene -> assets
    library/<project>/candidates/<scene_id>.json             <- everything a search found
"""
from __future__ import annotations

import json
import os
import re
import shutil
import struct
import subprocess
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .licensing import SOURCE_POLICY, monetization_summary
from .models import Candidate

EXT_BY_CTYPE = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/tiff": ".tif",
                "image/gif": ".gif", "video/mp4": ".mp4", "video/webm": ".webm", "video/quicktime": ".mov",
                "video/ogg": ".ogv", "application/pdf": ".pdf"}


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def slugify(text: str, n: int = 60) -> str:
    t = unicodedata.normalize("NFKD", text or "").encode("ascii", "ignore").decode()
    t = re.sub(r"[^a-zA-Z0-9]+", "-", t).strip("-").lower()
    return (t[:n].rstrip("-")) or "untitled"


def safe_id(s: str) -> str:
    return re.sub(r"[^A-Za-z0-9]+", "", s)[:24] or "x"


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", "utf-8")
    os.replace(tmp, path)


def read_json(path: Path, default: Any) -> Any:
    try:
        return json.loads(path.read_text("utf-8"))
    except (FileNotFoundError, ValueError):
        return default


# ---- media verification ------------------------------------------------------------------
def image_size(path: Path) -> tuple[int, int] | None:
    with open(path, "rb") as f:
        head = f.read(32)
        if head.startswith(b"\x89PNG\r\n\x1a\n"):
            return struct.unpack(">II", head[16:24])
        if head[:2] == b"\xff\xd8":
            f.seek(2)
            while True:
                b = f.read(1)
                while b and b != b"\xff":
                    b = f.read(1)
                while b == b"\xff":
                    b = f.read(1)
                if not b:
                    return None
                marker = b[0]
                if 0xC0 <= marker <= 0xCF and marker not in (0xC4, 0xC8, 0xCC):
                    f.read(3)
                    h, w = struct.unpack(">HH", f.read(4))
                    return w, h
                seg = f.read(2)
                if len(seg) < 2:
                    return None
                f.seek(struct.unpack(">H", seg)[0] - 2, 1)
    return None


def probe_media(path: Path, media_type: str) -> dict[str, Any]:
    """Return verified width/height(/duration) when we can measure them, else verified=False."""
    try:
        if media_type != "video" and path.suffix.lower() in (".jpg", ".jpeg", ".png"):
            sz = image_size(path)
            if sz:
                return {"width": sz[0], "height": sz[1], "verified": True}
        if shutil.which("ffprobe"):
            out = subprocess.run(
                ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration",
                 "-of", "json", str(path)], capture_output=True, text=True, timeout=60)
            j = json.loads(out.stdout or "{}")
            s = (j.get("streams") or [{}])[0]
            if s.get("width"):
                return {"width": s["width"], "height": s["height"], "verified": True,
                        "duration": float((j.get("format") or {}).get("duration") or 0)}
    except (OSError, ValueError, subprocess.SubprocessError):
        pass
    return {"verified": False}


def fingerprint(c: Candidate) -> str:
    return "|".join([slugify(c.creator, 30), str(int(c.duration)), str(c.width), str(c.height), c.media_type])


class Library:
    def __init__(self, root: Path):
        self.root = Path(root)
        self.map_path = self.root / "scene_map.json"

    # -- scanning -------------------------------------------------------------------------
    def sidecars(self):
        for p in sorted(self.root.glob("*/*.json")):
            if p.parent.name != "candidates":
                d = read_json(p, None)
                if isinstance(d, dict) and "asset" in d:
                    yield p, d

    def used(self) -> dict[str, dict[str, str]]:
        """refs / hashes / fingerprints already in the library -> which scene owns them."""
        refs, hashes, prints = {}, {}, {}
        for _, d in self.sidecars():
            a = d["asset"]
            refs[d["provenance"]["ref"]] = d["scene_id"]
            hashes[a["sha256"]] = d["scene_id"]
            if d["provenance"].get("fingerprint"):
                prints[d["provenance"]["fingerprint"]] = d["scene_id"]
        return {"refs": refs, "hashes": hashes, "prints": prints}

    # -- scene map ------------------------------------------------------------------------
    def load_map(self) -> dict:
        return read_json(self.map_path, {"scenes": {}})

    def update_scene(self, scene_id: str, **fields: Any) -> None:
        m = self.load_map()
        entry = m["scenes"].setdefault(scene_id, {"assets": []})
        entry.update(fields)
        entry["updated"] = now()
        m["generated"] = now()
        write_json(self.map_path, m)

    # -- adding an asset ------------------------------------------------------------------
    def add_asset(self, scene_id: str, c: Candidate, tmp: Path, dl: dict, probed: dict, *, how: str,
                  query: str = "", role: str = "primary", ai_generated: bool = False) -> Path:
        ext = EXT_BY_CTYPE.get(dl.get("content_type", ""), "") or Path(c.download_url.split("?")[0]).suffix.lower() or ".bin"
        name = f"{scene_id}_{slugify(c.title)}_{c.source}-{safe_id(c.source_id)}{ext}"
        dest = self.root / scene_id / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        os.replace(tmp, dest)
        meta = {
            "schema": 1, "scene_id": scene_id, "role": role, "selected_how": how, "retrieved_at": now(),
            "asset": {"file": name, "media_type": c.media_type, "content_type": dl.get("content_type"),
                      "bytes": dl.get("size"), "sha256": dl.get("sha256"),
                      "width": probed.get("width") or c.width, "height": probed.get("height") or c.height,
                      "dimensions_verified": probed.get("verified", False),
                      "duration_s": probed.get("duration") or c.duration, "ai_generated": ai_generated},
            "provenance": {"ref": c.ref, "source": c.source, "source_name": SOURCE_POLICY.get(c.source, {}).get("license", ""),
                           "original_url": c.page_url, "download_url": c.download_url if "key=" not in c.download_url else "(withheld: contains key)",
                           "title": c.title, "creator": c.creator, "credit_line": c.credit_line, "date": c.date,
                           "description": c.description, "tags": c.tags, "search_query": query or c.query,
                           "fingerprint": fingerprint(c)},
            "license": {"name": c.license_name, "url": c.license_url, "rights_text": c.rights_text,
                        "status": c.license_status, "notes": c.license_notes, **monetization_summary(c)},
            "match": {"relevance": c.relevance, "notes": c.relevance_notes, "flags": c.flags},
            "checks": {"watermark": "metadata-screened only; confirm visually in the edit",
                       "location_accuracy": "per scene `must` terms in metadata; confirm visually"},
        }
        write_json(dest.with_name(dest.name + ".json"), meta)
        m = self.load_map()
        entry = m["scenes"].setdefault(scene_id, {"assets": []})
        entry["assets"] = [a for a in entry.get("assets", []) if a.get("ref") != c.ref]
        entry["assets"].append({"file": f"{scene_id}/{name}", "metadata": f"{scene_id}/{name}.json", "ref": c.ref,
                                "role": role, "source": c.source, "license_status": c.license_status})
        entry["updated"] = now()
        m["generated"] = now()
        write_json(self.map_path, m)
        return dest

    # -- integrity ------------------------------------------------------------------------
    def validate(self) -> list[str]:
        import hashlib
        problems: list[str] = []
        seen_hash: dict[str, str] = {}
        seen_ref: dict[str, str] = {}
        for sc in self.root.glob("*/"):
            if sc.name == "candidates":
                continue
            for f in sc.iterdir():
                if f.suffix != ".json" and not f.name.endswith(".part") and not (sc / (f.name + ".json")).exists():
                    problems.append(f"{f.relative_to(self.root)}: media file has no metadata sidecar")
        for p, d in self.sidecars():
            media = p.with_suffix("")
            rel = p.relative_to(self.root)
            if not media.exists():
                problems.append(f"{rel}: media file missing (sidecar only; ignored if media is kept elsewhere)")
            else:
                h = hashlib.sha256(media.read_bytes()).hexdigest()
                if h != d["asset"]["sha256"]:
                    problems.append(f"{rel}: sha256 mismatch - file changed since download")
            for key, store in ((d["asset"]["sha256"], seen_hash), (d["provenance"]["ref"], seen_ref)):
                if key in store and store[key] != d["scene_id"]:
                    problems.append(f"{rel}: duplicate asset also used in scene {store[key]}")
                store[key] = d["scene_id"]
            if not d["provenance"]["original_url"] or not d["license"]["name"]:
                problems.append(f"{rel}: incomplete provenance (url/licence)")
            if d["license"]["status"] == "blocked":
                problems.append(f"{rel}: licence status is BLOCKED")
        return problems


def sha256_file(path: Path) -> str:
    import hashlib
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(1 << 20):
            h.update(chunk)
    return h.hexdigest()
