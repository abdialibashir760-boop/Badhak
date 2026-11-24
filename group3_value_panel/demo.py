"""Try the value panel on its own. Run:  python demo.py
Click an ID in the list on the left to 'select' it, then edit values on the right."""
import json
import tkinter as tk
from tkinter import ttk
from value_panel import ValuePanel

with open("sample_network_solved.json", encoding="utf-8") as f:
    network = json.load(f)

root = tk.Tk()
root.title("Value panel demo")
ids = [i["id"] for s in ("junctions", "reservoirs", "tanks", "pipes") for i in network[s]]
lst = tk.Listbox(root, height=16, exportselection=False)
for i in ids:
    lst.insert("end", i)
lst.pack(side="left", fill="y", padx=6, pady=6)

panel = ValuePanel(root, network, on_change=lambda i: print("changed:", i))
panel.pack(side="left", fill="both", padx=6, pady=6)
lst.bind("<<ListboxSelect>>", lambda e: panel.show(ids[lst.curselection()[0]]))

lang = tk.StringVar(value="en")
for code in ("en", "tr"):
    ttk.Radiobutton(root, text=code.upper(), value=code, variable=lang,
                    command=lambda: panel.set_language(lang.get())).pack(anchor="n")
root.mainloop()
