"""Science agencies: NASA Image and Video Library, USGS (ScienceBase)."""
from __future__ import annotations

from urllib.parse import quote_plus

from ..models import Candidate
from .base import Source, as_list, clean_html


class Nasa(Source):
    name, display = "nasa", "NASA Image and Video Library"
    media_types = ("image", "video", "map")

    def search(self, query, media_type, limit=15):
        mt = "video" if media_type == "video" else "image"
        data = self.http.get_json("https://images-api.nasa.gov/search", {"q": query, "media_type": mt, "page_size": limit})
        out = []
        for it in (data.get("collection") or {}).get("items", []):
            d = (it.get("data") or [{}])[0]
            thumb = next((link.get("href", "") for link in it.get("links", []) if link.get("render") == "image"), "")
            nid = d.get("nasa_id", "")
            out.append(Candidate(
                source=self.name, source_id=nid, title=clean_html(d.get("title", "")), media_type=mt if mt == "video" else media_type,
                page_url=f"https://images.nasa.gov/details/{quote_plus(nid)}", thumb_url=thumb,
                creator=d.get("photographer") or d.get("secondary_creator") or "", credit_line=d.get("secondary_creator", ""),
                description=clean_html(d.get("description", ""))[:800], tags=list(d.get("keywords") or []),
                date=d.get("date_created", ""), place=d.get("location", "") or "",
                extra={"center": d.get("center", ""), "needs_enrich": True}))
        return out

    def enrich(self, c):
        data = self.http.get_json(f"https://images-api.nasa.gov/asset/{c.source_id}")
        hrefs = [i.get("href", "").replace("http://", "https://") for i in (data.get("collection") or {}).get("items", [])]
        order = ("~orig.mp4", "~large.mp4", "~medium.mp4") if c.media_type == "video" else ("~orig.jpg", "~orig.png", "~large.jpg")
        for suffix in order:
            hit = next((h for h in hrefs if h.lower().endswith(suffix)), "")
            if hit:
                c.download_url = hit
                c.extra["rendition"] = suffix.lstrip("~")
                break
        c.extra["needs_enrich"] = False
        return c  # pixel size is verified after download (NASA does not report it in search)

    def search_url(self, q):
        return f"https://images.nasa.gov/search?q={quote_plus(q)}"


class Usgs(Source):
    """USGS has no single media API. We search ScienceBase (official, open) and use only the
    preview/browse image attached to a record. Landsat/Earth Explorer scenes need a USGS account
    (M2M API) and are listed as a manual lead instead."""
    name, display = "usgs", "USGS (ScienceBase)"
    media_types = ("image", "map")

    def search(self, query, media_type, limit=15):
        data = self.http.get_json("https://www.sciencebase.gov/catalog/items", {
            "q": query, "format": "json", "max": limit,
            "fields": "title,summary,webLinks,previewImage,contacts,tags,dateCreated,link"})
        out = []
        for it in data.get("items", []):
            orig = ((it.get("previewImage") or {}).get("original")) or {}
            url = orig.get("uri")
            if not url:
                continue
            owner = next((c.get("name", "") for c in it.get("contacts", []) if c.get("type") in ("Originator", "Point of Contact")), "")
            out.append(Candidate(
                source=self.name, source_id=it.get("id", ""), title=clean_html(it.get("title", "")), media_type=media_type,
                page_url=(it.get("link") or {}).get("url", f"https://www.sciencebase.gov/catalog/item/{it.get('id')}"),
                download_url=url, thumb_url=((it.get("previewImage") or {}).get("thumbnail") or {}).get("uri", ""),
                width=int(orig.get("width") or 0), height=int(orig.get("height") or 0), creator=owner,
                credit_line=owner, description=clean_html(it.get("summary", ""))[:600], date=str(it.get("dateCreated", "")),
                tags=[t.get("name", "") for t in as_list(it.get("tags")) if isinstance(t, dict)][:12],
                extra={"third_party": bool(owner) and "usgs" not in owner.lower() and "geological survey" not in owner.lower()}))
        return out

    def search_url(self, q):
        return f"https://www.usgs.gov/search?keywords={quote_plus(q)}"
