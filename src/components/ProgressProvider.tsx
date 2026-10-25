"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as P from "@/lib/progress";
import { localProgressStorage, type ProgressStorage } from "@/lib/storage";

interface ProgressContextValue {
  state: P.ProgressState;
  /** False until saved data has been read in the browser. */
  ready: boolean;
  /** False when the browser refuses to store data (e.g. private mode). */
  storageOk: boolean;
  savePhrase: (id: string, label: string) => void;
  removePhrase: (id: string, label: string) => void;
  setDifficulty: (id: string, difficulty: P.Difficulty | null) => void;
  recordPracticeAnswer: (good: boolean) => void;
  recordQuizAnswer: (correct: boolean) => void;
  recordRecallAnswer: (correct: boolean) => void;
  recordFlashcard: (id: string, knew: boolean) => void;
  completeLesson: (id: string, title: string, score: number, total: number) => void;
  completeScenario: (id: string, title: string, good: number, total: number) => void;
  resetAll: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({
  children,
  storage = localProgressStorage,
}: {
  children: React.ReactNode;
  storage?: ProgressStorage;
}) {
  const [state, setState] = useState<P.ProgressState>(P.emptyProgress);
  const [ready, setReady] = useState(false);
  const [storageOk, setStorageOk] = useState(true);
  const loaded = useRef(false);

  // Read saved data after the first render so server and browser HTML match.
  useEffect(() => {
    setState(storage.load());
    loaded.current = true;
    setReady(true);
  }, [storage]);

  useEffect(() => {
    if (!loaded.current) return;
    setStorageOk(storage.save(state));
  }, [state, storage]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      state,
      ready,
      storageOk,
      savePhrase: (id, label) => setState((s) => P.savePhrase(s, id, label)),
      removePhrase: (id, label) => setState((s) => P.removePhrase(s, id, label)),
      setDifficulty: (id, d) => setState((s) => P.setDifficulty(s, id, d)),
      recordPracticeAnswer: (good) => setState((s) => P.recordPracticeAnswer(s, good)),
      recordQuizAnswer: (ok) => setState((s) => P.recordQuizAnswer(s, ok)),
      recordRecallAnswer: (ok) => setState((s) => P.recordRecallAnswer(s, ok)),
      recordFlashcard: (id, knew) => setState((s) => P.recordFlashcard(s, id, knew)),
      completeLesson: (id, title, score, total) => setState((s) => P.completeLesson(s, id, title, score, total)),
      completeScenario: (id, title, good, total) => setState((s) => P.completeScenario(s, id, title, good, total)),
      resetAll: () => {
        storage.clear();
        setState(P.emptyProgress());
      },
    }),
    [state, ready, storageOk, storage],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside <ProgressProvider>.");
  return ctx;
}

