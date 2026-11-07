# Chart & Timeline Specifications

Data lives in `charts-data.json` (same IDs). Every number carries a source ID from `07-research-and-bibliography.md`.

## Visual identity (applies to everything)

| Token | Hex | Use |
|---|---|---|
| Ink black | `#0B0B0C` | Backgrounds |
| Charcoal | `#1A1A1C` | Panels, gridlines |
| Gold | `#C9A24B` | Nokia / the empire, key numbers, primary line |
| Ivory white | `#F3EFE6` | Text, labels |
| Dark red | `#8E1B1B` | Decline, rivals' ascent, warnings |
| Muted grey | `#8A8A86` | Axes, footnotes, source lines |

- Type: a serif display face for titles (e.g. Playfair Display or Cormorant), a clean grotesque for numbers/labels (e.g. Inter). Numbers use tabular figures.
- Source line on every chart, bottom-left, 18 px, grey: *Source: Canalys (via PocketGamer.biz), Q4 2010*.
- **Honesty rules:** (1) Never join points from different trackers with a continuous line — use dots with a tracker label. (2) Axes start at zero for bar charts. (3) Mark approximate values with "≈". (4) Do not extrapolate.

## Chart A — "Share of the world's phones" (script §1, §3, §8)
- **Type:** dot timeline, 5 labelled points (2000, Q1 2004, Q4 2007, FY 2007, Q1 2012). Gold dots up to 2007, the 2012 dot turns dark red.
- **Why dots, not a line:** the figures come from different trackers (Nokia estimate, Gartner, Strategy Analytics). Label each dot with its tracker.
- **Motion:** dots drop in left→right over 0.5 s each, with a soft gold glow; a bracket appears between the 40% and 22.5% dots reading "five years".
- **On-screen data:** ≈30% (2000) · 28.9% (Q1 2004) · ≈40% (Q4 2007, Nokia est.) · 37.8% (2007, Gartner) · 22.5% (Q1 2012, Strategy Analytics).
- **Note for narrator/editor:** the Q1 2004 dip (28.9%) is not mentioned in the script. Show it only if you add a line; otherwise drop the dot.

## Chart B — "Q4 2010: the platform crossover" (script §5)
- **Type:** 3 horizontal bars, zero baseline.
- **Data:** Android 32.9 M (dark red) · Symbian 31.0 M (gold) · iPhone 16.2 M (ivory). Total market 101.2 M.
- **Motion:** bars grow for 1 s each; Android bar ends 0.3 s after Symbian's, then a thin "overtakes" marker slides in.
- **Footnote:** "Some outlets report 33.3 M for Android; 32.9 M is the more widely reported shipment figure."
- **Source:** Canalys via Engadget / PocketGamer.biz.

## Chart C — "Symbian's share of smartphones" (script §5)
- **Type:** step chart with dots; 2006 drawn as a range bar (67–73%).
- **Data:** 2006 67–73% · 2008 52.4% · 2009 47.2% · 2010 37.6% · Q2 2011 22.1% · Q2 2012 4.4%.
- **Annotation:** a vertical hairline at 11 Feb 2011 (Microsoft announcement) and a callout *"Q3→Q4 2010: share already falling, 39% → 31%"* — this is the defenders' point in §7, so the chart needs to be on screen for both.
- **Footnote:** mixed sources (Canalys through 2010; IDC for 2012).

## Chart D — "Nokia smartphone shipments per quarter" (script §7)
- **Type:** 4 vertical bars with *uneven spacing* to show the real time gap.
- **Data:** Q4 2010 28.0 M · Q3 2011 16.8 M · Q4 2011 19.6 M · Q3 2012 6.3 M (stacked: Lumia 2.9 + Symbian 3.4).
- **Annotation:** vertical line "11 Feb 2011 — Windows Phone partnership announced" between the first and second bars.
- **Do not** claim causation on the chart itself; the narration carries both interpretations. Add a small label "Contested: see narration".

## Chart E — "First place changes hands" (script §8)
- **Type:** two big bars, Samsung vs Nokia, Q1 2012.
- **Data:** Samsung 93.5 M (dark red) · Nokia 82.7 M (gold). IDC cross-check in footnote: 93.8 M vs 82.7 M; Apple 35.1 M.
- **Motion:** bars rise in sync; Nokia's tops out below; a crown icon (flat, no brand logos) slides from Nokia's bar to Samsung's. Don't use either company's logo.

## Chart F — "What Microsoft paid" (script §8)
- **Type:** stacked single bar / waterfall: €3.79 bn + €1.65 bn = €5.44 bn.
- **Footnote:** "Final price slightly higher after balance-sheet adjustments." Announced 3 Sep 2013, closed 25 Apr 2014.
- **Follow-up tile:** "July 2015 — Microsoft impairment ≈ $7.6 bn" (dark red).

## Chart G — "2007: the peak" tiles (script §3)
- Three number tiles count up over 1.5 s: **437.1 million** handsets · **€51.1 bn** net sales · **€7.99 bn** operating profit (footnote: includes €858 M net special items).

## Timeline — "A fifteen-year collapse" (script §2–§9)
- **Type:** a horizontal timeline, 1991→2016, in three bands: **Nokia** (gold, above), **Rivals** (dark red, below), **Market** (white, centre line).
- **Entries:** see `timeline` in `charts-data.json` (22 entries). Show only the 8–10 that the narration mentions at each moment; the full set is for the final "zoom out" in §9.
- **Motion:** camera tracks right along the line; each event card pops with a 0.2 s ease-out and a soft tick sound.

## Interface comparison — "keypad vs. screen" (script §4)
- **Type:** split screen. Left: real photograph of a keypad-era Nokia phone (Commons). Right: real photograph of the first iPhone (Commons). A slow 2D push-in on each, with three callouts drawn as thin gold lines: *"Keys" / "Fixed menus" / "Hardware as the product"* vs. *"Touch" / "Apps" / "Software as the product"*.
- Use only photographs of the real devices. Do not redraw the interfaces.

## Build suggestions
- Cheapest route: render all charts as SVG → animate in Remotion (already used in this repo, e.g. `gravity-documentary/`). Reading the data from `charts-data.json` keeps numbers and visuals in sync.
- Export each chart as an alpha-channel overlay at 1920×1080 so the editor can place them over footage.
