"""Platform stock libraries with official, key-based APIs."""
from __future__ import annotations

from urllib.parse import quote_plus

from ..models import Candidate
from .base import Source, as_list


class Pixabay(Source):
    name, display = "pixabay", "Pixabay"
    media_types = ("image", "video")

    def search(self, query, media_type, limit=15):
        if media_type == "video":
            data = self.http.get_json("https://pixabay.com/api/videos/",
                                      {"key": self.key(), "q": query, "per_page": max(3, limit), "safesearch": "true"})
        else:
            data = self.http.get_json("https://pixabay.com/api/", {
                "key": self.key(), "q": query, "per_page": max(3, limit), "image_type": "photo",
                "orientation": "horizontal", "min_width": 1920, "safesearch": "true"})
        out = []
        for h in data.get("hits", []):
            tags = [t.strip() for t in h.get("tags", "").split(",") if t.strip()]
            c = Candidate(source=self.name, source_id=str(h["id"]), title=" ".join(tags[:6]) or f"pixabay {h['id']}",
                          media_type=media_type, page_url=h.get("pageURL", ""), creator=h.get("user", ""),
                          tags=tags, description=h.get("description") or "", thumb_url=h.get("webformatURL", ""),
                          extra={"ai_generated": bool(h.get("isAiGenerated")), "user_url": h.get("userURL", "")})
            if media_type == "video":
                best = max((v for v in (h.get("videos") or {}).values() if v.get("url")),
                           key=lambda v: v.get("height", 0), default=None)
                if not best:
                    continue
                c.download_url, c.width, c.height = best["url"], best.get("width", 0), best.get("height", 0)
                c.duration = float(h.get("duration") or 0)
                c.thumb_url = best.get("thumbnail", "")
            else:
                c.download_url = h.get("largeImageURL", "")
                c.width, c.height = h.get("imageWidth", 0), h.get("imageHeight", 0)
            out.append(c)
        return out

    def search_url(self, q):
        return f"https://pixabay.com/videos/search/{quote_plus(q)}/"


class Pexels(Source):
    name, display = "pexels", "Pexels"
    media_types = ("image", "video")

    def _h(self):
        return {"Authorization": self.key()}

    def search(self, query, media_type, limit=15):
        if media_type == "video":
            data = self.http.get_json("https://api.pexels.com/videos/search",
                                      {"query": query, "per_page": limit, "orientation": "landscape"}, self._h())
            out = []
            for v in data.get("videos", []):
                files = [f for f in v.get("video_files", []) if f.get("link") and f.get("file_type") == "video/mp4"]
                best = max(files, key=lambda f: f.get("height") or 0, default=None)
                if not best:
                    continue
                user = v.get("user") or {}
                out.append(Candidate(
                    source=self.name, source_id=str(v["id"]), title=(v.get("url", "").rstrip("/").rsplit("/", 1)[-1]
                                                                    .rsplit("-", 1)[0].replace("-", " ")) or f"pexels {v['id']}",
                    media_type="video", page_url=v.get("url", ""), download_url=best["link"],
                    width=best.get("width") or 0, height=best.get("height") or 0, duration=float(v.get("duration") or 0),
                    creator=user.get("name", ""), thumb_url=v.get("image", ""), extra={"creator_url": user.get("url", "")}))
            return out
        data = self.http.get_json("https://api.pexels.com/v1/search",
                                  {"query": query, "per_page": limit, "orientation": "landscape"}, self._h())
        return [Candidate(source=self.name, source_id=str(p["id"]), title=p.get("alt") or f"pexels {p['id']}",
                          media_type="image", page_url=p.get("url", ""), download_url=(p.get("src") or {}).get("original", ""),
                          width=p.get("width", 0), height=p.get("height", 0), creator=p.get("photographer", ""),
                          description=p.get("alt") or "", thumb_url=(p.get("src") or {}).get("medium", ""),
                          extra={"creator_url": p.get("photographer_url", "")})
                for p in data.get("photos", [])]

    def search_url(self, q):
        return f"https://www.pexels.com/search/videos/{quote_plus(q)}/"


class Coverr(Source):
    """Coverr API is available on request. Response mapping follows its public docs and is
    NOT verified against a live key here - the parser is defensive and tests use a synthetic fixture."""
    name, display = "coverr", "Coverr"
    media_types = ("video",)

    def search(self, query, media_type, limit=15):
        data = self.http.get_json("https://api.coverr.co/videos", {"query": query, "page_size": limit, "urls": "true"},
                                  {"Authorization": f"Bearer {self.key()}"})
        out = []
        for v in as_list(data.get("hits")):
            urls = v.get("urls") or {}
            dl = urls.get("mp4_download") or urls.get("mp4") or ""
            if not dl or v.get("is_vertical"):
                continue
            out.append(Candidate(
                source=self.name, source_id=str(v.get("id")), title=v.get("title") or "", media_type="video",
                page_url=f"https://coverr.co/videos/{v.get('id')}", download_url=dl,
                width=int(v.get("max_width") or 0), height=int(v.get("max_height") or 0),
                duration=float(v.get("duration") or 0), creator=(v.get("author") or {}).get("name", "") if isinstance(v.get("author"), dict) else "",
                description=v.get("description") or "", tags=[str(t) for t in as_list(v.get("tags"))],
                thumb_url=v.get("thumbnail") or v.get("poster") or ""))
        return out

    def search_url(self, q):
        return f"https://coverr.co/s?q={quote_plus(q)}"


class Unsplash(Source):
    name, display = "unsplash", "Unsplash"
    media_types = ("image",)

    def _h(self):
        return {"Authorization": f"Client-ID {self.key()}", "Accept-Version": "v1"}

    def search(self, query, media_type, limit=15):
        data = self.http.get_json("https://api.unsplash.com/search/photos",
                                  {"query": query, "per_page": limit, "orientation": "landscape"}, self._h())
        out = []
        for p in data.get("results", []):
            user = p.get("user") or {}
            out.append(Candidate(
                source=self.name, source_id=p["id"], title=p.get("description") or p.get("alt_description") or p["id"],
                media_type="image", page_url=(p.get("links") or {}).get("html", ""), download_url=(p.get("urls") or {}).get("full", ""),
                width=p.get("width", 0), height=p.get("height", 0), creator=user.get("name", ""),
                description=p.get("alt_description") or "", tags=[t.get("title", "") for t in p.get("tags", [])],
                thumb_url=(p.get("urls") or {}).get("small", ""), date=p.get("created_at", ""),
                place=((p.get("location") or {}).get("name") or ""),
                extra={"download_location": (p.get("links") or {}).get("download_location", ""),
                       "creator_url": (user.get("links") or {}).get("html", "")}))
        return out

    def download_request(self, c):
        # API terms: register the download by calling download_location before fetching the file.
        loc = c.extra.get("download_location")
        if loc:
            r = self.http.get_json(loc, headers=self._h(), use_cache=False)
            if r.get("url"):
                return r["url"], {}
        return c.download_url, {}

    def search_url(self, q):
        return f"https://unsplash.com/s/photos/{quote_plus(q)}"
