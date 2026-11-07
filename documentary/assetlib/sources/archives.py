"""Open archives: Wikimedia Commons, Library of Congress, Internet Archive, Smithsonian."""
from __future__ import annotations

import re
from urllib.parse import quote, quote_plus

from ..models import Candidate
from .base import Source, as_list, clean_html

VIDEO_EXT = (".mp4", ".mov", ".webm", ".ogv", ".mpeg", ".mpg")


class Commons(Source):
    name, display = "commons", "Wikimedia Commons"
    media_types = ("image", "map", "video")
    API = "https://commons.wikimedia.org/w/api.php"

    def search(self, query, media_type, limit=15):
        ftype = "video" if media_type == "video" else ("bitmap|drawing" if media_type == "map" else "bitmap")
        data = self.http.get_json(self.API, {
            "action": "query", "format": "json", "generator": "search", "gsrnamespace": 6, "gsrlimit": limit,
            "gsrsearch": f"{query} filetype:{ftype}", "prop": "imageinfo", "iiurlwidth": 3840,
            "iiprop": "url|size|mime|extmetadata|mediatype"})
        out = []
        for page in (data.get("query") or {}).get("pages", {}).values():
            ii = (page.get("imageinfo") or [{}])[0]
            em = ii.get("extmetadata") or {}
            val = lambda k: clean_html((em.get(k) or {}).get("value", ""))  # noqa: E731
            mime = ii.get("mime", "")
            url = ii.get("url", "")
            if mime in ("image/tiff", "image/svg+xml") and ii.get("thumburl"):
                url = ii["thumburl"]  # editors handle a 3840px render better than a 200MB TIFF
            title = page.get("title", "").removeprefix("File:")
            out.append(Candidate(
                source=self.name, source_id=str(page.get("pageid")), title=title,
                media_type="video" if ii.get("mediatype") in ("VIDEO",) or mime.startswith("video") else media_type,
                page_url=ii.get("descriptionurl", ""), download_url=url, thumb_url=ii.get("thumburl", ""),
                width=ii.get("width", 0), height=ii.get("height", 0),
                creator=val("Artist"), credit_line=val("Credit"), description=val("ImageDescription"),
                license_name=val("LicenseShortName") or val("UsageTerms"), license_url=val("LicenseUrl"),
                date=val("DateTimeOriginal") or val("DateTime"), tags=[t for t in val("Categories").split("|") if t][:12],
                attribution_required=(val("AttributionRequired").lower() == "true") if val("AttributionRequired") else None,
                extra={"restrictions": val("Restrictions"), "non_free": val("NonFree").lower() == "true",
                       "mime": mime, "derived_render": url != ii.get("url", "")}))
        return out

    def search_url(self, q):
        return f"https://commons.wikimedia.org/w/index.php?search={quote_plus(q)}&ns6=1"


class LibraryOfCongress(Source):
    name, display = "loc", "Library of Congress"
    media_types = ("image", "map", "film")
    PATHS = {"image": "photos", "map": "maps", "film": "film-and-videos"}

    def search(self, query, media_type, limit=15):
        data = self.http.get_json(f"https://www.loc.gov/{self.PATHS.get(media_type, 'photos')}/",
                                  {"q": query, "fo": "json", "c": limit})
        out = []
        for r in data.get("results", []):
            it = r.get("item") or {}
            imgs = [u for u in as_list(r.get("image_url")) if u]
            adv = " ".join(as_list(it.get("rights_advisory")) + as_list(it.get("rights")))
            out.append(Candidate(
                source=self.name, source_id=str(it.get("control_number") or r.get("id", "")).rstrip("/").rsplit("/", 1)[-1],
                title=clean_html(r.get("title", "")), media_type=media_type, page_url=r.get("url") or r.get("id", ""),
                download_url=imgs[-1].split("#")[0] if imgs else "", thumb_url=imgs[0].split("#")[0] if imgs else "",
                creator=clean_html(" ".join(as_list(it.get("contributor_names")))), date=str(r.get("date") or ""),
                description=clean_html(" ".join(as_list(r.get("description")))), rights_text=adv,
                tags=[clean_html(str(s)) for s in as_list(it.get("subjects"))][:12],
                extra={"mime": as_list(r.get("mime_type")), "needs_enrich": not adv,
                       "access_restricted": bool(r.get("access_restricted"))}))
        return out

    def enrich(self, c):
        """Read the item record for rights advisory + larger image."""
        if not c.page_url:
            return c
        d = self.http.get_json(c.page_url.rstrip("/") + "/", {"fo": "json"})
        it = d.get("item") or {}
        c.rights_text = clean_html(" ".join(as_list(it.get("rights_advisory")) + as_list(it.get("rights")))) or c.rights_text
        c.credit_line = clean_html(" ".join(as_list(it.get("repository")))) or c.credit_line
        c.creator = c.creator or clean_html(" ".join(as_list(it.get("contributor_names"))))
        c.license_name = c.license_name or ("Public domain / no known restrictions" if re.search(
            r"no known (copyright|restrictions)|public domain", c.rights_text, re.I) else "")
        best = ""
        for res in d.get("resources", []):
            for group in as_list(res.get("files")):
                for f in as_list(group):
                    if isinstance(f, dict) and f.get("mimetype") in ("image/jpeg", "video/mp4") and f.get("url"):
                        if f.get("height", 0) >= c.height:
                            best, c.width, c.height = f["url"], f.get("width", c.width), f.get("height", c.height)
        c.download_url = best or c.download_url
        c.extra["needs_enrich"] = False
        return c

    def search_url(self, q):
        return f"https://www.loc.gov/search/?q={quote_plus(q)}"


class InternetArchive(Source):
    name, display = "archive", "Internet Archive / Prelinger"
    media_types = ("film", "video", "image")

    def search(self, query, media_type, limit=15):
        mt = {"image": "image"}.get(media_type, "movies")
        coll = ' AND collection:prelinger' if media_type == "film" else ""
        data = self.http.get_json("https://archive.org/advancedsearch.php", {
            "q": f'"{query}" AND mediatype:{mt}{coll}', "fl[]": ["identifier", "title", "creator", "year", "licenseurl",
                                                                   "rights", "description", "date"],
            "rows": limit, "output": "json", "sort[]": "downloads desc"})
        out = []
        for d in (data.get("response") or {}).get("docs", []):
            lic = d.get("licenseurl") or ""
            out.append(Candidate(
                source=self.name, source_id=d["identifier"], title=clean_html(" ".join(as_list(d.get("title")))),
                media_type=media_type, page_url=f"https://archive.org/details/{d['identifier']}",
                creator=clean_html(" ".join(as_list(d.get("creator")))), date=str(d.get("year") or d.get("date") or ""),
                description=clean_html(" ".join(as_list(d.get("description"))))[:600],
                license_url=lic if isinstance(lic, str) else "", license_name=("Public domain / CC0" if re.search(
                    r"publicdomain|cc0|zero", str(lic), re.I) else (str(lic) if lic else "")),
                rights_text=clean_html(" ".join(as_list(d.get("rights")))), extra={"needs_enrich": True}))
        return out

    def enrich(self, c):
        m = self.http.get_json(f"https://archive.org/metadata/{c.source_id}")
        meta = m.get("metadata") or {}
        lic = meta.get("licenseurl") or c.license_url
        if lic:
            c.license_url = lic
            c.license_name = "Public domain / CC0" if re.search(r"publicdomain|cc0|zero", lic, re.I) else lic
        c.rights_text = clean_html(" ".join(as_list(meta.get("rights")))) or c.rights_text
        c.credit_line = clean_html(" ".join(as_list(meta.get("collection")))) or c.credit_line
        vids = [f for f in m.get("files", []) if f.get("format") in ("h.264", "MPEG4", "h.264 HD", "512Kb MPEG4")
                or str(f.get("name", "")).lower().endswith(VIDEO_EXT)]
        if vids:
            best = max(vids, key=lambda f: int(float(f.get("height") or 0)))
            c.download_url = f"https://archive.org/download/{c.source_id}/{best['name']}"
            c.width, c.height = int(float(best.get("width") or 0)), int(float(best.get("height") or 0))
            c.duration = float(best.get("length") or 0)
            c.extra["file_format"] = best.get("format")
        c.extra["needs_enrich"] = False
        return c

    def search_url(self, q):
        return f"https://archive.org/search?query={quote_plus(q)}&and[]=collection%3A%22prelinger%22"


class Smithsonian(Source):
    name, display = "smithsonian", "Smithsonian Open Access"
    media_types = ("image", "map")

    def search(self, query, media_type, limit=15):
        data = self.http.get_json("https://api.si.edu/openaccess/api/v1.0/search", {
            "api_key": self.key(), "q": f'{query} AND online_media_type:"Images"', "rows": limit})
        out = []
        for row in (data.get("response") or {}).get("rows", []):
            c = row.get("content") or {}
            dnr = c.get("descriptiveNonRepeating") or {}
            media = [m for m in as_list((dnr.get("online_media") or {}).get("media")) if m.get("type") == "Images"]
            if not media:
                continue
            m = media[0]
            free = c.get("freetext") or {}
            names = [clean_html(x.get("content", "")) for x in as_list(free.get("name"))]
            dates = [clean_html(x.get("content", "")) for x in as_list(free.get("date"))]
            notes = [clean_html(x.get("content", "")) for x in as_list(free.get("notes"))]
            out.append(Candidate(
                source=self.name, source_id=row.get("id", ""), title=clean_html((row.get("title") or "")),
                media_type=media_type, page_url=dnr.get("record_link", ""), download_url=m.get("content", ""),
                thumb_url=m.get("thumbnail", ""), creator="; ".join(n for n in names if n), date="; ".join(dates),
                description=" ".join(notes)[:600], credit_line=dnr.get("unit_name", ""),
                tags=[clean_html(str(t)) for t in as_list((c.get("indexedStructured") or {}).get("topic"))][:12],
                extra={"usage_access": (m.get("usage") or {}).get("access", "")}))
        return out

    def search_url(self, q):
        return f"https://www.si.edu/search/collection-images?edan_q={quote_plus(q)}&edan_fq%5B0%5D=media_usage%3ACC0"
