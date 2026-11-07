import json, sys, time, urllib.parse, urllib.request
UA = "RiseAndRuinResearch/1.0 (documentary research)"
queries = {
 "nokia_3310": "Nokia 3310", "nokia_lumia_800": "Nokia Lumia 800", "nokia_n97": "Nokia N97",
 "nokia_5800": "Nokia 5800 XpressMusic", "nokia_n9": "Nokia N9", "nokia_808": "Nokia 808 PureView",
 "nokia_hq_espoo": "Nokia House Espoo Keilaniemi", "iphone_original": "iPhone 2007 first generation",
 "htc_dream": "HTC Dream T-Mobile G1", "nokia_cityman": "Mobira Cityman 900",
 "nokia_2110": "Nokia 2110", "symbian_screenshot": "Symbian S60 screenshot",
 "steve_jobs_2007": "Steve Jobs iPhone introduction 2007 Macworld", "jorma_ollila": "Jorma Ollila",
 "stephen_elop": "Stephen Elop", "nokia_factory": "Nokia factory Salo Oulu Komárom",
}
out = {}
for key, q in queries.items():
    params = {"action":"query","generator":"search","gsrsearch":q,"gsrnamespace":"6","gsrlimit":"5",
              "prop":"imageinfo","iiprop":"url|size|extmetadata","iiextmetadatafilter":"LicenseShortName|Artist|Credit",
              "format":"json"}
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
    for attempt in range(4):
        try:
            data = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent":UA}), timeout=30))
            res = []
            for p in data.get("query",{}).get("pages",{}).values():
                ii = p.get("imageinfo",[{}])[0]; m = ii.get("extmetadata",{})
                res.append({"title":p["title"],"license":m.get("LicenseShortName",{}).get("value"),
                            "width":ii.get("width"),"height":ii.get("height"),"url":ii.get("url")})
            out[key] = {"query":q,"results":res}; print(key, len(res)); break
        except Exception as e:
            time.sleep(8*(attempt+1)); err = str(e)
    else:
        out[key] = {"query":q,"error":err}; print(key,"ERR",err)
    time.sleep(5)
json.dump(out, open(sys.argv[1],"w"), indent=1)
