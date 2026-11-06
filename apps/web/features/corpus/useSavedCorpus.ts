"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { createCorpusRemote } from "./corpus-api";
import type { CorpusSelectionAnalysis, CorpusSelectionContext } from "@libitu/types/stage-one";
import { CORPUS_STORAGE_KEY, CorpusStorage, type SavedCorpusRecord, type CorpusEdit } from "./corpus-storage";

const CORPUS_CHANGED = "libitu:corpus:changed";

export function useSavedCorpus() {
  const { isLoaded, userId, getToken } = useAuth();
  const [storage] = useState(() => new CorpusStorage(() => window.localStorage));
  const [state, setState] = useState(storage.state);
  const [retry, setRetry] = useState(0);
  const owner = userId ?? null;

  useEffect(() => storage.subscribe(setState), [storage]);
  useEffect(() => {
    if (!isLoaded) return;
    const open = () => storage.open(owner, owner ? createCorpusRemote(owner, getToken) : null);
    // Avoid duplicate imports during development's setup/cleanup probe.
    let disposed = false;
    Promise.resolve().then(() => { if (!disposed) void open(); });
    let pending = false;
    const refresh = () => {
      if (storage.state.busy) pending = true;
      else void open();
    };
    const unsubscribe = storage.subscribe(state => {
      if (pending && !state.busy) { pending = false; queueMicrotask(() => { if (!disposed) refresh(); }); }
    });
    const localChanged = (event: Event) => {
      if ((event as CustomEvent).detail !== storage) refresh();
    };
    const changed = (event: StorageEvent) => {
      if (event.key === CORPUS_STORAGE_KEY || event.key === CORPUS_CHANGED) refresh();
    };
    window.addEventListener(CORPUS_CHANGED, localChanged);
    window.addEventListener("storage", changed);
    return () => {
      disposed = true;
      unsubscribe();
      window.removeEventListener(CORPUS_CHANGED, localChanged);
      storage.close();
      window.removeEventListener("storage", changed);
    };
  }, [storage, owner, isLoaded, getToken, retry]);

  function notifyRemoved() {
    window.dispatchEvent(new CustomEvent(CORPUS_CHANGED, { detail: storage }));
    try { window.localStorage.setItem(CORPUS_CHANGED, crypto.randomUUID()); } catch { /* Same-page sync remains available. */ }
  }
  const current = isLoaded && state.owner === owner;
  return {
    records: current ? state.records : [],
    ready: Boolean(current && state.ready),
    busy: Boolean(!current || state.busy),
    error: current ? state.error : null,
    signedIn: Boolean(owner),
    update: (record: SavedCorpusRecord, edit: CorpusEdit) => current ? storage.update(record, edit) : Promise.resolve(false),
    save: (record: SavedCorpusRecord) => current ? storage.save(record) : Promise.resolve(false),
    hydrate: (
      record: SavedCorpusRecord,
      context: CorpusSelectionContext,
      analyze: () => Promise<CorpusSelectionAnalysis>,
    ) => current ? storage.hydrate(record, context, analyze) : Promise.resolve(null),
    remove: async (record: SavedCorpusRecord) => {
      const removed = current && await storage.remove(record);
      if (removed) notifyRemoved();
      return removed;
    },
    removeMany: async (records: SavedCorpusRecord[]) => {
      const removed = current ? await storage.removeMany(records) : [];
      if (removed.length) notifyRemoved();
      return removed;
    },
    retry: () => setRetry((value) => value + 1)
  };
}
