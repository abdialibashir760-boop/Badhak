# Bank transfer explainer (Remotion)

10-second, 1920×1080, 30 fps animated explainer: **how money moves between banks**.
Everything is SVG + CSS-in-React driven by `useCurrentFrame()` — no external images.

| Time | Scene |
| --- | --- |
| 0–2s | Person presses SEND in a banking app (`PhoneScene.tsx`) |
| 2–5s | Camera dives into the phone, through an authorisation tunnel (`Tunnel.tsx`) |
| 5–8s | Glowing money particles cross the clearing network; sender balance $1,000 → $0 (`Network.tsx`, `Bank.tsx`) |
| 8–10s | Receiving balance counts up $250 → $1,250 and is confirmed |

Bank names, the recipient and the balances are fictional.

## Commands
- `npm start` — Remotion Studio
- `npm run render` — render `out/bank-transfer.mp4`
- `npm run typecheck`

If Remotion can't download its headless browser, add
`--browser-executable=<path to chromium> --chrome-mode=chrome-for-testing`.
