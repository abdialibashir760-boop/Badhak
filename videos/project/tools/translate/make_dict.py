#!/usr/bin/env python3
"""Rebuild dict.json from dict_tr.py (English on-screen text -> Turkish)."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dict_tr as d
out = {k: d.translate(k) for k in d.D}
json.dump(out, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "dict.json"), "w"), ensure_ascii=False)
print(len(out), "strings")
