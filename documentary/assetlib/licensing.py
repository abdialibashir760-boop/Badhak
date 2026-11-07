"""Licence policy. Platform defaults are *hints*; the per-asset record always wins.

Verdicts:  clear   -> usable in a monetised YouTube video as recorded
           review  -> a human must confirm something before use (reason in notes)
           blocked -> not usable (NC/ND/non-free/unknown-restricted)
Policy text reflects each platform's published terms as understood when written;
`tos_url` is stored with every asset so it can be re-checked. This is not legal advice.
"""
from __future__ import annotations

import re

from .models import Candidate

SOURCE_POLICY: dict[str, dict] = {
    "pixabay": dict(access="api-key", env="PIXABAY_API_KEY", license="Pixabay Content License",
                    license_url="https://pixabay.com/service/license-summary/",
                    attribution=False, commercial=True,
                    caveats="Free for commercial use, no attribution needed. No identifiable people/brands/trademarks "
                            "implied endorsement; do not resell unaltered. Check for 'AI-generated' label on item page.",
                    docs="https://pixabay.com/api/docs/"),
    "pexels": dict(access="api-key", env="PEXELS_API_KEY", license="Pexels License",
                   license_url="https://www.pexels.com/license/", attribution=False, commercial=True,
                   caveats="Free commercial use; attribution not required, but the API terms ask for a visible link to "
                           "Pexels/photographer where results are shown. Do not imply endorsement by depicted people/brands.",
                   docs="https://www.pexels.com/api/documentation/"),
    "mixkit": dict(access="manual", env="", license="Mixkit License (verify on item page)",
                   license_url="https://mixkit.co/license/", attribution=False, commercial=True,
                   caveats="No public API: assets are registered manually after a human reads the item licence. "
                           "Cannot be redistributed as standalone files.",
                   docs="https://mixkit.co/license/"),
    "coverr": dict(access="api-key", env="COVERR_API_KEY", license="Coverr License",
                   license_url="https://coverr.co/license", attribution=False, commercial=True,
                   caveats="API access is granted by Coverr on request. Attribution appreciated, not required; "
                           "do not resell unaltered or use in a competing stock service.",
                   docs="https://api.coverr.co/docs/"),
    "commons": dict(access="open", env="", license="per-file (see extmetadata)",
                    license_url="https://commons.wikimedia.org/wiki/Commons:Licensing", attribution=None, commercial=None,
                    caveats="Every file has its own licence; CC BY/BY-SA require credit, BY-SA adds share-alike. "
                            "Check 'Restrictions' (personality, trademark) per file.",
                    docs="https://www.mediawiki.org/wiki/API:Main_page"),
    "loc": dict(access="open", env="", license="per-item rights statement",
                license_url="https://www.loc.gov/legal/", attribution=False, commercial=None,
                caveats="LOC holds many works it does not own the rights to. Use only items whose rights advisory says "
                        "no known restrictions / public domain; credit the collection as courtesy.",
                docs="https://www.loc.gov/apis/json-and-yaml/"),
    "archive": dict(access="open", env="", license="per-item (licenseurl / rights)",
                    license_url="https://archive.org/about/terms.php", attribution=None, commercial=None,
                    caveats="Prelinger Archives films are mostly public domain but the Archive makes no warranty; "
                            "confirm per item, and beware third-party material (music, stock) inside a film.",
                    docs="https://archive.org/developers/"),
    "nasa": dict(access="open", env="", license="NASA media usage guidelines (generally public domain)",
                 license_url="https://www.nasa.gov/nasa-brand-center/images-and-media/", attribution=False, commercial=True,
                 caveats="NASA-created media is generally not copyrighted; items credited to other parties (ESA, "
                         "contractors, individuals) need their own check. Do not imply NASA endorsement.",
                 docs="https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf"),
    "usgs": dict(access="open", env="", license="Public domain (US Government work) unless item says otherwise",
                 license_url="https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits",
                 attribution=False, commercial=True,
                 caveats="USGS asks for credit ('Photo/Image: USGS'); some pages reproduce third-party material.",
                 docs="https://www.sciencebase.gov/about/content/sciencebase-api"),
    "noaa": dict(access="manual", env="", license="Public domain (US Government work) unless item says otherwise",
                 license_url="https://www.noaa.gov/protecting-your-privacy", attribution=False, commercial=True,
                 caveats="No documented media API: register manually after checking the photo's credit line "
                         "(many NOAA Photo Library images credit contractors/partners).",
                 docs="https://photolib.noaa.gov/"),
    "unsplash": dict(access="api-key", env="UNSPLASH_ACCESS_KEY", license="Unsplash License",
                     license_url="https://unsplash.com/license", attribution=False, commercial=True,
                     caveats="Photos only. Free commercial use; API terms require triggering the download endpoint and "
                             "crediting the photographer where the app shows results. Cannot be used to build a competing service.",
                     docs="https://unsplash.com/documentation"),
    "smithsonian": dict(access="api-key", env="SI_API_KEY", license="CC0 (Open Access items only)",
                        license_url="https://www.si.edu/openaccess", attribution=False, commercial=True,
                        caveats="Only records flagged usage.access = CC0 are accepted; the rest of the collection is "
                                "restricted. Key comes from api.data.gov.",
                        docs="https://edan.si.edu/openaccess/apidocs/"),
}

_PD = re.compile(r"public\s*domain|\bpd\b|\bpdm\b|cc0|cc\s*zero|no known (copyright|restrictions)|"
                 r"not subject to copyright|u\.?s\.? government work|pd-usgov|pd-nasa|pd-old", re.I)
_NC_ND = re.compile(r"\bnc\b|non-?commercial|\bnd\b|no-?deriv|-nc|-nd", re.I)
_NONFREE = re.compile(r"non-?free|fair use|all rights reserved|copyrighted|permission required", re.I)
_BY = re.compile(r"\bcc[- ]by\b|cc-by|attribution", re.I)
_SA = re.compile(r"\bsa\b|-sa|share-?alike", re.I)


def classify_license(text: str) -> tuple[str, bool | None, str]:
    """Return (status, attribution_required, note) from free text. Order matters."""
    t = (text or "").strip()
    if not t:
        return "review", None, "no licence text supplied by the source"
    if _NONFREE.search(t):
        return "blocked", None, f"non-free / reserved rights: {t!r}"
    if _NC_ND.search(t):
        return "blocked", None, f"NonCommercial/NoDerivatives licence cannot be used in a monetised video: {t!r}"
    if _PD.search(t) and not _BY.search(t):
        return "clear", False, "public domain / CC0"
    if _BY.search(t):
        if _SA.search(t):
            return "review", True, f"{t!r} is ShareAlike: confirm how the share-alike clause applies to the finished video"
        return "clear", True, f"{t!r} requires attribution"
    return "review", None, f"unrecognised licence text {t!r}"


def attribution_text(c: Candidate) -> str:
    who = c.creator or c.credit_line or "unknown creator"
    lic = c.license_name or "licence not recorded"
    return f"\"{c.title}\" — {who} — {c.source} — {lic} — {c.page_url}"


def assess(c: Candidate) -> Candidate:
    """Fill license_status/notes/attribution on a candidate. Never upgrades a source's own 'blocked'."""
    pol = SOURCE_POLICY.get(c.source, {})
    notes: list[str] = []
    text = " ".join(x for x in (c.license_name, c.rights_text) if x)

    if c.source in ("pixabay", "pexels", "unsplash", "coverr", "mixkit"):
        status = "clear"
        c.license_name = c.license_name or pol["license"]
        c.license_url = c.license_url or pol["license_url"]
        c.attribution_required = False
        notes.append(f"platform licence ({pol['license_url']}); {pol['caveats']}")
        if c.extra.get("ai_generated"):
            status = "review"
            notes.append("item is labelled AI-generated: not authentic footage; use only per the AI fallback rule")
    elif c.source == "smithsonian":
        if c.extra.get("usage_access", "").upper() == "CC0":
            status, c.attribution_required = "clear", False
            c.license_name, c.license_url = "CC0 1.0 (Smithsonian Open Access)", "https://creativecommons.org/publicdomain/zero/1.0/"
            notes.append("record flagged usage.access = CC0")
        else:
            status = "blocked"
            notes.append(f"record is not CC0 (usage.access={c.extra.get('usage_access') or 'missing'})")
    elif c.source in ("nasa", "usgs"):
        status, attr, note = "clear", False, "US-government media: generally public domain"
        owner = (c.credit_line or c.creator or "").lower()
        third = [w for w in ("esa", "jaxa", "getty", "shutterstock", "copyright", "©", "courtesy of") if w in owner]
        if third or c.extra.get("third_party"):
            status, note = "review", f"credit line suggests a third party ({', '.join(third) or 'flagged'}): verify rights"
        c.license_name = c.license_name or pol["license"]
        c.license_url = c.license_url or pol["license_url"]
        c.attribution_required = attr
        notes.append(note)
        notes.append(pol["caveats"])
    else:  # commons, loc, archive, noaa(manual), unknown: judge from the item's own text
        status, attr, note = classify_license(text)
        if c.attribution_required is None:
            c.attribution_required = attr
        notes.append(note)
        if c.source == "commons" and c.extra.get("restrictions"):
            status = "review" if status == "clear" else status
            notes.append(f"Commons restrictions tag: {c.extra['restrictions']} (personality/trademark rights may apply)")
        if c.source == "commons" and c.extra.get("non_free"):
            status = "blocked"
            notes.append("Commons marks this file non-free")
        if c.source in ("loc", "archive") and status == "clear" and not c.rights_text and not c.license_url:
            status = "review"
            notes.append("no explicit rights statement in the record")
    if not c.page_url:
        status = "review" if status == "clear" else status
        notes.append("no original page URL: cannot record provenance")
    c.license_status, c.license_notes = status, notes
    return c


def monetization_summary(c: Candidate) -> dict:
    ok = c.license_status == "clear"
    return {
        "commercial_use": "yes" if ok else ("no" if c.license_status == "blocked" else "unconfirmed"),
        "youtube_monetization": "yes" if ok else ("no" if c.license_status == "blocked" else "unconfirmed"),
        "attribution_required": c.attribution_required,
        "attribution_text": attribution_text(c),
        "checked_against": SOURCE_POLICY.get(c.source, {}).get("license_url", ""),
        "note": "Automated check of recorded metadata only; verify the item page before publishing. Not legal advice.",
    }
