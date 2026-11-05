'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';

const Selection = createContext<{ word: { sentence: string; index: number } | null; select(sentence: string, index: number): void } | null>(null);
export function AnalysisSelection({ children }: { children: ReactNode }) {
  const [word, setWord] = useState<{ sentence: string; index: number } | null>(null);
  return <Selection.Provider value={{ word, select: (sentence, index) => setWord({ sentence, index }) }}>{children}</Selection.Provider>;
}
export function useAnalysisSelection(sentence: string) {
  const context = useContext(Selection);
  const [local, setLocal] = useState<number | null>(null);
  return { selected: context ? context.word?.sentence === sentence ? context.word.index : null : local,
    select: (index: number) => context ? context.select(sentence, index) : setLocal(index) };
}
