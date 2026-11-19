# GİM NET – Properties panel (Group 3)

Panel that **shows and changes** the values of the selected node or pipe.
Fields and units follow *GİM NET Data Format v0.1*. English and Turkish text.

| Selected item | Fields in the panel |
|---|---|
| Junction | elevation (m), demand (L/s) |
| Pipe | length (m), diameter (mm), roughness (C, or mm if `options.headloss` is `"DW"`), minor_loss K, status (OPEN / CLOSED / CV) |
| Reservoir | head (m) |
| Tank | elevation, init_level, min_level, max_level (m), diameter |

`id`, `x`, `y`, `from`, `to` are not editable here (ids are referenced by pipes; moving nodes is the drawing area's job).

## Files
- `panel-model.js` – logic only: field list, number parsing (accepts `12,5`), validation, `applyEdit()`. Tested.
- `properties-panel.js` – the DOM panel. `panel.css` – styling (visible focus, error text).
- `panel.test.mjs` – run with `node --test panel.test.mjs`.
- `demo.html` – example of how the drawing area calls the panel. Browsers block ES modules from `file://`, so open it through a local server in this folder, for example `python3 -m http.server`.

## How the drawing area uses it
```js
const panel = createPropertiesPanel(el, { getNetwork: () => network, onChange: (n, info) => { network = n; } });
panel.select('P2');       // user clicked an item   (null = nothing selected)
panel.setLanguage('tr');  // 'en' | 'tr'
```
`onChange` gets a **new** network object after each valid edit; the old one is never mutated.
`info.resultsStale` is `true` if the file already had `results`. The panel does not touch `results`
(the format says Group 3 writes only network parts); decide in the main app whether to clear it or warn.

## Validation
Length, diameter and roughness must be > 0. Minor loss ≥ 0. Elevation and demand can be any number
(negative demand = water enters). Tank levels must satisfy min ≤ initial ≤ max. Invalid input is
refused with a message and the network stays unchanged.

## Open questions for the supervisors
- Tank `diameter` unit is not written in v0.1; the panel assumes mm (the general "diameter = mm" rule).
- Should editing a network delete old `results`?
