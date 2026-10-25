# Türkçem — project conventions

Everyday Turkish learning web app. Interface language is English; Turkish is always shown with a translation.

## Commands
- `npm run dev` — dev server; `npm run build` / `npm start` — production
- `npm run lint`, `npm run typecheck`, `npm test` — run all three before committing

## Stack
Next.js 15 App Router, React 19, TypeScript (strict), Tailwind CSS 3. Keep dependencies minimal; ask before adding paid services.

## Structure
- `src/data/` — all learning content (lessons, scenarios). Content only, no logic.
- `src/lib/progress.ts` — pure state functions (no browser APIs). Add tests in `tests/` when changing.
- `src/lib/storage.ts` — `ProgressStorage` adapter (localStorage now). Swap this for a database later; always sanitise loaded data.
- `src/components/ProgressProvider.tsx` — only place that holds progress state; use `useProgress()`.
- Pages are server components that render client components for interactive parts.

## Conventions
- Never invent progress; every number comes from `ProgressState`.
- Pages that read saved data must not render date- or storage-dependent values on the server (avoid hydration mismatch); read after mount.
- Quiz options are shuffled with a seeded shuffle (`shuffleWithSeed`) so server and client agree.
- Turkish content: correct diacritics (ç ğ ı İ ö ş ü), a register label, natural English plus an optional literal translation. Do not invent expressions. Every scenario step needs exactly one `best` option and at least one `off` option (tested).
- Practice is rule-based; never describe it as AI.
- Design: forest green (`forest-*`), warm off-white (`cream-*`), rounded cards, visible focus, `prefers-reduced-motion` respected. Use `.card`, `.btn-*` classes from `globals.css`.
- No API keys in client code. No Supabase until it is configured; show a clear message instead of a fake connection.
