"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="card text-center">
      <h1 className="font-display text-2xl font-bold text-forest-900">Something went wrong</h1>
      <p className="mt-2 text-sm text-ink-soft">The page couldn&apos;t be shown. Your saved progress is safe in your browser.</p>
      <button type="button" className="btn-primary mt-4" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
