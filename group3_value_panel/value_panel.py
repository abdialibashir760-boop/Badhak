"""Value panel (Group 3): shows and edits the selected node or pipe.

How the other parts use it:
    panel = ValuePanel(parent, network_dict, on_change=redraw_function)
    panel.show("J1")      # when the user clicks an item in the drawing area
    panel.clear()         # when nothing is selected
    panel.refresh()       # after New / Open / Calculate (network or results changed)
    panel.set_language("tr")   # "en" or "tr"
"""
import tkinter as tk
from tkinter import ttk

try:  # Group 2's checker
    from gimnet_data.validator import validate_network
except ImportError:  # e.g. openpyxl not installed: load the checker file directly
    import importlib.util, os
    _path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "gimnet_data", "validator.py")
    try:
        _spec = importlib.util.spec_from_file_location("gimnet_validator", _path)
        _mod = importlib.util.module_from_spec(_spec)
        _spec.loader.exec_module(_mod)
        validate_network = _mod.validate_network
    except (OSError, ImportError, AttributeError):
        validate_network = None  # then the panel only checks that a value is a number

# Which fields to edit for each kind of item: (key, unit)
FIELDS = {
    "junctions": [("elevation", "m"), ("demand", "L/s")],
    "reservoirs": [("head", "m")],
    "tanks": [("elevation", "m"), ("init_level", "m"), ("min_level", "m"),
              ("max_level", "m"), ("diameter", "m")],
    "pipes": [("length", "m"), ("diameter", "mm"), ("roughness", ""),
              ("minor_loss", ""), ("status", "")],
}
STATUS = ["OPEN", "CLOSED", "CV"]
# Results to show (read-only): (key, unit)
RESULT_FIELDS = {
    "nodes": [("pressure", "m"), ("head", "m")],
    "links": [("velocity", "m/s"), ("flow", "L/s"), ("headloss", "m")],
}

TEXT = {
    "en": {
        "title": "Properties", "none": "Select a node or pipe.",
        "junctions": "Junction", "reservoirs": "Reservoir", "tanks": "Tank", "pipes": "Pipe",
        "id": "ID", "from": "From", "to": "To", "results": "Results",
        "no_results": "Not calculated yet.", "bad_number": "Enter a number.",
        "elevation": "Elevation", "demand": "Demand", "head": "Head",
        "init_level": "Initial level", "min_level": "Min level", "max_level": "Max level",
        "diameter": "Diameter", "length": "Length", "roughness": "Roughness",
        "minor_loss": "Minor loss", "status": "Status",
        "pressure": "Pressure", "velocity": "Velocity", "flow": "Flow", "headloss": "Head loss",
    },
    "tr": {
        "title": "Özellikler", "none": "Bir düğüm veya boru seçin.",
        "junctions": "Düğüm", "reservoirs": "Rezervuar", "tanks": "Depo", "pipes": "Boru",
        "id": "No", "from": "Başlangıç", "to": "Bitiş", "results": "Sonuçlar",
        "no_results": "Henüz hesaplanmadı.", "bad_number": "Bir sayı girin.",
        "elevation": "Kot", "demand": "Talep", "head": "Yük",
        "init_level": "Başlangıç seviyesi", "min_level": "En düşük seviye",
        "max_level": "En yüksek seviye", "diameter": "Çap", "length": "Uzunluk",
        "roughness": "Pürüzlülük", "minor_loss": "Yerel kayıp", "status": "Durum",
        "pressure": "Basınç", "velocity": "Hız", "flow": "Debi", "headloss": "Yük kaybı",
    },
}


class ValuePanel(ttk.Frame):
    def __init__(self, parent, network, on_change=None, language="en"):
        super().__init__(parent, padding=8)
        self.network = network          # the dict from Group 2's load_network
        self.on_change = on_change      # called as on_change(item_id) after a good edit
        self.language = language
        self.item_id = None
        self.section = None
        self.entries = {}               # field name -> StringVar
        self.refresh()

    # ----- functions the other parts call -----
    def set_network(self, network):
        self.network = network
        self.item_id = None
        self.refresh()

    def show(self, item_id):
        self.item_id = item_id
        self.refresh()

    def clear(self):
        self.show(None)

    def set_language(self, language):
        self.language = language
        self.refresh()

    def refresh(self):
        """Redraw the panel from the current data."""
        for child in self.winfo_children():
            child.destroy()
        self.entries = {}
        t = TEXT[self.language]
        ttk.Label(self, text=t["title"], font=("TkDefaultFont", 11, "bold")).grid(
            row=0, column=0, columnspan=3, sticky="w")
        self.section, item = self._find(self.item_id)
        if item is None:
            ttk.Label(self, text=t["none"]).grid(row=1, column=0, columnspan=3, sticky="w", pady=6)
            return
        row = 1
        row = self._readonly(row, t["id"], f'{t[self.section]} {item["id"]}')
        if self.section == "pipes":
            row = self._readonly(row, t["from"], item["from"])
            row = self._readonly(row, t["to"], item["to"])
        for key, unit in FIELDS[self.section]:
            row = self._editor(row, key, unit, item[key])
        self.message = ttk.Label(self, text="", foreground="#b00020", wraplength=240)
        self.message.grid(row=row, column=0, columnspan=3, sticky="w")
        self._show_results(row + 1)

    # ----- inside -----
    def _find(self, item_id):
        if item_id is None:
            return None, None
        for section in ("junctions", "reservoirs", "tanks", "pipes"):
            for item in self.network.get(section, []):
                if item["id"] == item_id:
                    return section, item
        return None, None

    def _readonly(self, row, label, value):
        ttk.Label(self, text=label).grid(row=row, column=0, sticky="w", pady=2)
        ttk.Label(self, text=str(value)).grid(row=row, column=1, sticky="w", padx=6)
        return row + 1

    def _editor(self, row, key, unit, value):
        t = TEXT[self.language]
        ttk.Label(self, text=t[key]).grid(row=row, column=0, sticky="w", pady=2)
        var = tk.StringVar(value=str(value))
        self.entries[key] = var
        if key == "status":
            box = ttk.Combobox(self, textvariable=var, values=STATUS, state="readonly", width=10)
            box.bind("<<ComboboxSelected>>", lambda e, k=key: self._commit(k))
            box.grid(row=row, column=1, padx=6)
        else:
            box = ttk.Entry(self, textvariable=var, width=12)
            box.bind("<Return>", lambda e, k=key: self._commit(k))
            box.bind("<FocusOut>", lambda e, k=key: self._commit(k))
            box.grid(row=row, column=1, padx=6)
        ttk.Label(self, text=unit).grid(row=row, column=2, sticky="w")
        return row + 1

    def _commit(self, key):
        """Check the typed value. Keep it if good, put the old one back if bad."""
        if self.item_id is None or not self.winfo_exists():
            return
        section, item = self._find(self.item_id)
        if item is None or key not in self.entries:
            return
        text = self.entries[key].get().strip()
        old = item[key]
        if key == "status":
            new = text
        else:
            try:
                new = float(text.replace(",", "."))
            except ValueError:
                return self._reject(key, old, TEXT[self.language]["bad_number"])
            if new == int(new) and isinstance(old, int):
                new = int(new)
        if new == old:
            return
        item[key] = new
        if validate_network is not None:
            errors = validate_network(self.network)
            if errors:
                item[key] = old
                return self._reject(key, old, errors[0])
        self.message.config(text="")
        if self.on_change:
            self.on_change(self.item_id)

    def _reject(self, key, old, message):
        self.entries[key].set(str(old))
        self.message.config(text=message)

    def _show_results(self, row):
        t = TEXT[self.language]
        ttk.Separator(self).grid(row=row, column=0, columnspan=3, sticky="ew", pady=6)
        ttk.Label(self, text=t["results"], font=("TkDefaultFont", 10, "bold")).grid(
            row=row + 1, column=0, columnspan=3, sticky="w")
        results = self.network.get("results")
        kind = "links" if self.section == "pipes" else "nodes"
        found = results.get(kind, {}).get(self.item_id) if results else None
        if not found:
            ttk.Label(self, text=t["no_results"]).grid(row=row + 2, column=0, columnspan=3, sticky="w")
            return
        r = row + 2
        for key, unit in RESULT_FIELDS[kind]:
            if key in found:
                ttk.Label(self, text=t[key]).grid(row=r, column=0, sticky="w")
                ttk.Label(self, text=f"{found[key]:.3f} {unit}").grid(row=r, column=1, columnspan=2, sticky="w", padx=6)
                r += 1
