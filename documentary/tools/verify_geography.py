#!/usr/bin/env python3
"""Check the Lesotho geometry we will animate against Natural Earth (public domain).

    python3 -I tools/verify_geography.py path/to/ne_10m_admin_0_countries.geojson [out.json]

Checks (all computed, nothing typed in by hand):
  * Lesotho is one polygon; area and perimeter (spherical approximation, ~0.3% error)
  * every border vertex coincides with a South Africa vertex  -> fully enclaved
  * no other country has a vertex on the Lesotho border         -> only one neighbour
Use the same file for every map render so the on-screen border can never drift from the data.
"""
from __future__ import annotations

import json
import math
import sys

R = 6371.0088  # km, mean Earth radius


def ring_area_km2(ring):
    # spherical polygon area (Chamberlain & Duquette); ring = [(lon, lat), ...] closed
    s = 0.0
    for (lon1, lat1), (lon2, lat2) in zip(ring, ring[1:]):
        s += math.radians(lon2 - lon1) * (2 + math.sin(math.radians(lat1)) + math.sin(math.radians(lat2)))
    return abs(s) * R * R / 2


def haversine(a, b):
    (lo1, la1), (lo2, la2) = a, b
    p1, p2 = math.radians(la1), math.radians(la2)
    h = math.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(math.radians(lo2 - lo1) / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))


def key(pt):
    return (round(pt[0], 4), round(pt[1], 4))


def polygons(geom):
    return [geom["coordinates"]] if geom["type"] == "Polygon" else geom["coordinates"]


def main(path, out=None):
    data = json.load(open(path, encoding="utf-8"))
    feats = {f["properties"]["ADM0_A3"]: f for f in data["features"]}
    lso = feats["LSO"]["geometry"]
    polys = polygons(lso)
    outer = polys[0][0]
    area = sum(ring_area_km2(p[0]) - sum(ring_area_km2(h) for h in p[1:]) for p in polys)
    perim = sum(haversine(a, b) for a, b in zip(outer, outer[1:]))
    border = {key(p) for p in outer}
    neighbours = {}
    for code, f in feats.items():
        if code == "LSO":
            continue
        shared = sum(1 for poly in polygons(f["geometry"]) for ring in poly for pt in ring if key(pt) in border)
        if shared:
            neighbours[code] = shared
    zaf_pts = {key(pt) for poly in polygons(feats["ZAF"]["geometry"]) for ring in poly for pt in ring}
    on_zaf = sum(1 for k in border if k in zaf_pts)
    lons, lats = [p[0] for p in outer], [p[1] for p in outer]
    rep = {
        "source_file": path.rsplit("/", 1)[-1],
        "polygon_count": len(polys),
        "area_km2_computed": round(area),
        "perimeter_km_computed": round(perim),
        "border_vertices": len(border),
        "vertices_shared_with_ZAF": on_zaf,
        "share_with_ZAF": round(on_zaf / len(border), 4),
        "neighbours_by_shared_vertices": neighbours,
        "bbox_lon_lat": [round(min(lons), 3), round(min(lats), 3), round(max(lons), 3), round(max(lats), 3)],
        "fully_enclaved": set(neighbours) == {"ZAF"} and on_zaf / len(border) > 0.99,
        "note": "Natural Earth 10m is generalised; compare with national figures (CIA Factbook 30,355 km2) and "
                "record disagreements. Border length differs by source (e.g. 909 km vs 1,106 km).",
    }
    print(json.dumps(rep, indent=2))
    if out:
        json.dump(rep, open(out, "w", encoding="utf-8"), indent=2)
    return 0 if rep["fully_enclaved"] else 1


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    sys.exit(main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None))
