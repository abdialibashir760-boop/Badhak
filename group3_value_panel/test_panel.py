import json, tkinter as tk
from value_panel import ValuePanel
net = json.load(open("sample_network_solved.json"))
root = tk.Tk(); p = ValuePanel(root, net); changed = []
p.on_change = changed.append
p.show("P2"); p.entries["diameter"].set("250"); p._commit("diameter")
assert net["pipes"][1]["diameter"] == 250 and changed == ["P2"]
p.entries["diameter"].set("-5"); p._commit("diameter")
assert net["pipes"][1]["diameter"] == 250, "negative must be rejected"
p.entries["diameter"].set("abc"); p._commit("diameter")
assert net["pipes"][1]["diameter"] == 250
p.entries["status"].set("CLOSED"); p._commit("status")
assert net["pipes"][1]["status"] == "CLOSED"
p.show("J1"); p.entries["demand"].set("12.5"); p._commit("demand")
assert net["junctions"][0]["demand"] == 12.5
p.show("R1"); p.set_language("tr"); p.clear()
print("ALL OK")
