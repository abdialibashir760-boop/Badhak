# Türkçem — everyday Turkish for real conversations

Türkçem helps learners speak confident, practical Turkish. Instead of memorising isolated words, you work through
realistic situations: talking to coworkers, professors and classmates, ordering food, making friends, asking for
directions and visiting a doctor. The interface is in English; every Turkish phrase comes with a natural English
translation, a usage note and a register label (casual / neutral / formal).

## What works today

- **Home**: welcome, daily goal (10 exercises per day), "Continue learning", daily phrase, suggested conversations, saved words and a progress summary.
- **Learn**: 8 lessons in 6 categories (work, university, everyday, shopping and food, social, asking for help). Each has a situation, expressions with translations and usage notes, a sample conversation, a 3-question quiz and a completion state.
- **Practice**: 5 scenario conversations with multiple-choice replies. After each answer you see why it fits (or not), whether it sounds natural, what every alternative means, and the most useful real-life reply. The logic is **pre-written and rule-based, not AI**.
- **Vocabulary**: save/remove expressions from lessons, mark them Easy or Difficult, flashcards (flip and self-grade) and a recall quiz.
- **Progress**: lessons completed, questions answered, accuracy, saved expressions, recent activity. All values are calculated from real activity. A reset button clears everything.
- Everything is saved in your browser (`localStorage`) and survives a refresh. Corrupt or unavailable storage is handled gracefully.
- Responsive: bottom navigation on phones, sidebar on desktop.

## Technologies

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 3, ESLint, Vitest. No external services or API keys are needed.

## Install and run

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev        # development server at http://localhost:3000
```

Then open http://localhost:3000 in your browser. To try it on a phone on the same Wi-Fi, open `http://<your-computer-ip>:3000`.

## Other commands

```bash
npm run build      # production build
npm run start      # serve the production build (run build first)
npm run lint       # ESLint
npm run typecheck  # TypeScript check
npm test           # unit tests (progress logic, storage sanitising, content checks)
```

## Deploy

The project is Vercel-compatible with no extra settings:

1. Push the repository to GitHub.
2. In Vercel choose **Add New → Project**, import the repository and press **Deploy**.

No environment variables are required.

## Project layout

```
src/app/          Pages (home, learn, practice, vocabulary, progress)
src/components/   UI components and the ProgressProvider (React context)
src/data/         Lessons, scenarios and categories (plain TypeScript)
src/lib/          progress.ts (pure logic), storage.ts (storage adapter), shuffle.ts
tests/            Unit tests
```

Storage lives behind the `ProgressStorage` interface in `src/lib/storage.ts`. To move to a database such as Supabase
later, write another adapter with `load`, `save` and `clear` and pass it to `ProgressProvider`.

## Not implemented yet (planned)

- Accounts and cloud sync (Supabase), so progress follows you between devices.
- AI-powered or open-ended conversation, speech recognition and audio pronunciation.
- Spaced-repetition scheduling for flashcards.
- More lessons and scenarios (the current content is a starter set).
- Automated browser tests in the repository (the main flows were tested manually with a script, see below).

## Testing status

Run before delivery: lint, type check, unit tests, production build, and a scripted Playwright browser run covering
navigation, completing a lesson, a practice conversation, saving/removing vocabulary, flashcards, the recall quiz,
reload persistence, progress numbers, reset, the 404 page and horizontal-overflow checks at 360, 768 and 1280 px.
The Turkish content was written carefully but has not been reviewed by a native speaker; please have one check it
before wider use.
