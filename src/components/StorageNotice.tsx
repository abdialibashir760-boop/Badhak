"use client";

import { useProgress } from "./ProgressProvider";

export function StorageNotice() {
  const { storageOk, ready } = useProgress();
  if (!ready || storageOk) return null;
  return (
    <div role="alert" className="mb-5 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      Your browser is blocking local storage (private mode or blocked site data), so progress will be lost when you
      close or refresh this page.
    </div>
  );
}
