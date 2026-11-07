#!/usr/bin/env python3
"""Search and download Pixabay videos. Reads the key from PIXABAY_API_KEY and never prints it.

Usage:
  python3 -I tools/pixabay_fetch.py search "factory assembly line" [--per-page 5]
  python3 -I tools/pixabay_fetch.py download 40054 --size large --out assets/stock/

Why a custom User-Agent: Pixabay answers 403 to Python's default "Python-urllib/x.y"
User-Agent (curl and python-requests are fine). Always send an identifying one.
Only API/CDN URLs are fetched; pixabay.com pages are never scraped (they return 403).
"""
import argparse, json, os, sys, urllib.error, urllib.parse, urllib.request

UA = "RiseAndRuin/1.0 (documentary research)"
API = "https://pixabay.com/api/videos/"

def key():
    k = os.environ.get("PIXABAY_API_KEY")
    if not k:
        sys.exit("PIXABAY_API_KEY is not set")
    return k

def call(params):
    params = dict(params, key=key())
    url = API + "?" + urllib.parse.urlencode(params)
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:   # never echo the URL: it contains the key
        sys.exit(f"Pixabay API error: HTTP {e.code} {e.reason}")

def search(a):
    d = call({"q": a.query, "per_page": a.per_page, "safesearch": "true"})
    print(f"{d.get('totalHits')} hits")
    for h in d["hits"]:
        print(f"{h['id']:>8}  {h['duration']:>3}s  {h['type']:<9} {h['pageURL']}  | {h['tags'][:70]}")

def download(a):
    d = call({"id": a.id})
    if not d["hits"]:
        sys.exit("no such video id")
    v = d["hits"][0]["videos"].get(a.size) or d["hits"][0]["videos"]["medium"]
    os.makedirs(a.out, exist_ok=True)
    dest = os.path.join(a.out, f"pixabay-{a.id}-{a.size}.mp4")
    req = urllib.request.Request(v["url"], headers={"User-Agent": UA})   # CDN URL, no key in it
    with urllib.request.urlopen(req, timeout=120) as r, open(dest, "wb") as f:
        while chunk := r.read(1 << 20):
            f.write(chunk)
    print(f"saved {dest} ({v['width']}x{v['height']}, {os.path.getsize(dest)/1e6:.1f} MB)")
    print(f"credit: Pixabay video {a.id} - {d['hits'][0]['pageURL']}")

p = argparse.ArgumentParser()
sub = p.add_subparsers(dest="cmd", required=True)
s = sub.add_parser("search"); s.add_argument("query"); s.add_argument("--per-page", type=int, default=5); s.set_defaults(fn=search)
dl = sub.add_parser("download"); dl.add_argument("id", type=int); dl.add_argument("--size", default="large", choices=["large","medium","small","tiny"]); dl.add_argument("--out", default="assets/stock"); dl.set_defaults(fn=download)
a = p.parse_args(); a.fn(a)
