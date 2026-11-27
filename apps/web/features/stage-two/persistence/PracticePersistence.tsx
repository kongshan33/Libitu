"use client";

import { useDelayedPending } from "@/components/ui/use-delayed-pending";
import { toast } from "@/components/ui/Toast";

import { useAuth } from "@clerk/nextjs";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPracticeApi, type PracticeApi } from "./practice-api";
import { PracticeOutbox, type PracticeSaveState } from "./practice-outbox";
import { createReferenceApi, type ReferenceApi } from "../server-reference/api";
import { CaptureUploads } from '../server-reference/capture-uploads';

const SAVE_TOAST_ID = "practice-save";
const REFERENCE_UPLOAD_TOAST_ID = "practice-reference-upload";

const audioPreferenceKeys = { analyze: "libitu:server-analysis:v1", retain: "libitu:recording-retention:v1" } as const;
type AudioPreference = keyof typeof audioPreferenceKeys;

function readAudioPreference(owner: string, preference: AudioPreference) {
  try { return localStorage.getItem(`${audioPreferenceKeys[preference]}:${owner}`) !== "off"; }
  catch { return true; }
}

const Context = createContext<{ api: PracticeApi; referenceApi: ReferenceApi; outbox: PracticeOutbox; state: PracticeSaveState;
  analyze: boolean; retain: boolean; setAudioPreference(preference: AudioPreference, value: boolean): void; captures: CaptureUploads; captureVersion: number } | null>(null);

type AccountResources = {
  owner: string; api: PracticeApi; referenceApi: ReferenceApi;
  outbox: PracticeOutbox; captures: CaptureUploads;
};

/** Keep children mounted across authentication and client-side route changes. */
export function PracticePersistence({ children }: { children: ReactNode }) {
  const { isLoaded, userId, getToken } = useAuth();
  const [resources, setResources] = useState<AccountResources | null>(null);
  const [state, setState] = useState<PracticeSaveState>({ pending: 0, pendingSentences: [], errors: [], savedVersion: 0 });
  const [captureVersion, setCaptureVersion] = useState(0);
  const [preferences, setPreferences] = useState({ owner: "", analyze: true, retain: true });
  const active = isLoaded && resources?.owner === userId ? resources : null;
  const showUpload = useDelayedPending(Boolean(active?.captures.pendingUploads));
  const showSave = useDelayedPending(Boolean(active && state.pending));
  const showSaveError = Boolean(active && state.errors.length);
  const saveTracker = useRef({ owner: "", savedVersion: 0, hadFreshSave: false, showingPersistent: false });
  const uploadTracker = useRef({ owner: "", uploadedVersion: 0, hadFreshUpload: false, showingPersistent: false });

  useEffect(() => {
    if (!isLoaded || !userId) return;
    const api = createPracticeApi(userId, getToken);
    const referenceApi = createReferenceApi(userId, getToken);
    const outbox = new PracticeOutbox(api);
    const captures = new CaptureUploads(referenceApi);
    let live = true;
    const offSaves = outbox.subscribe(value => { if (live) setState(value); });
    const offCaptures = captures.subscribe(() => { if (live) setCaptureVersion(value => value + 1); });
    setPreferences({ owner: userId, analyze: readAudioPreference(userId, "analyze"), retain: readAudioPreference(userId, "retain") });
    setState(outbox.state);
    setCaptureVersion(0);
    setResources({ owner: userId, api, referenceApi, outbox, captures });
    return () => {
      live = false;
      offSaves(); offCaptures();
      outbox.dispose(); captures.dispose();
    };
  }, [isLoaded, userId, getToken]);

  useEffect(() => {
    if (!active) {
      saveTracker.current = { owner: "", savedVersion: 0, hadFreshSave: false, showingPersistent: false };
      uploadTracker.current = { owner: "", uploadedVersion: 0, hadFreshUpload: false, showingPersistent: false };
      toast.dismiss(SAVE_TOAST_ID);
      toast.dismiss(REFERENCE_UPLOAD_TOAST_ID);
    }
    return () => {
      toast.dismiss(SAVE_TOAST_ID);
      toast.dismiss(REFERENCE_UPLOAD_TOAST_ID);
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;
    if (saveTracker.current.owner !== active.owner) {
      saveTracker.current = { owner: active.owner, savedVersion: state.savedVersion, hadFreshSave: false, showingPersistent: false };
    }
    if (state.savedVersion > saveTracker.current.savedVersion) {
      saveTracker.current.savedVersion = state.savedVersion;
      saveTracker.current.hadFreshSave = true;
    }
    if (showSaveError) {
      saveTracker.current.showingPersistent = true;
      toast.error("Your practice still needs saving", {
        id: SAVE_TOAST_ID,
        description: `${state.errors[0].message} Keep this page open and stay signed in until saving finishes.`,
        durationMs: 0,
        dismissible: false,
        dismissOnAction: false,
        action: { label: "Retry saves", onClick: () => active.outbox.retry() }
      });
    } else if (showSave) {
      saveTracker.current.showingPersistent = true;
      toast.info(`Saving ${state.pending} practice ${state.pending === 1 ? "take" : "takes"}…`, {
        id: SAVE_TOAST_ID,
        description: "Keep this page open and stay signed in until saving finishes.",
        durationMs: 0,
        pending: true,
        dismissible: false
      });
    } else if (state.pending === 0 && saveTracker.current.hadFreshSave) {
      saveTracker.current.hadFreshSave = false;
      saveTracker.current.showingPersistent = false;
      toast.success("Take saved", { id: SAVE_TOAST_ID });
    } else if (state.pending === 0 && saveTracker.current.showingPersistent) {
      saveTracker.current.showingPersistent = false;
      toast.dismiss(SAVE_TOAST_ID);
    }
  }, [active, showSave, showSaveError, state.errors, state.pending, state.savedVersion]);

  useEffect(() => {
    if (!active) return;
    const { pendingUploads, uploadedVersion, uploadErrors } = active.captures;
    if (uploadTracker.current.owner !== active.owner) {
      uploadTracker.current = { owner: active.owner, uploadedVersion, hadFreshUpload: false, showingPersistent: false };
    }
    if (uploadedVersion > uploadTracker.current.uploadedVersion) {
      uploadTracker.current.uploadedVersion = uploadedVersion;
      uploadTracker.current.hadFreshUpload = true;
    }
    if (uploadErrors.length > 0) {
      uploadTracker.current.showingPersistent = true;
      const firstError = uploadErrors[0];
      toast.error("Reference upload failed", {
        id: REFERENCE_UPLOAD_TOAST_ID,
        description: firstError.message,
        durationMs: 0,
        dismissible: true,
        dismissOnAction: false,
        action: { label: "Retry upload", onClick: () => void active.captures.retry(firstError.key) }
      });
    } else if (showUpload) {
      uploadTracker.current.showingPersistent = true;
      toast.info("Uploading reference audio…", {
        id: REFERENCE_UPLOAD_TOAST_ID,
        description: "Keep this page open until the upload finishes.",
        durationMs: 0,
        pending: true,
        dismissible: false
      });
    } else if (pendingUploads === 0 && uploadTracker.current.hadFreshUpload) {
      uploadTracker.current.hadFreshUpload = false;
      uploadTracker.current.showingPersistent = false;
      toast.success("Reference audio uploaded", { id: REFERENCE_UPLOAD_TOAST_ID });
    } else if (pendingUploads === 0 && uploadTracker.current.showingPersistent) {
      uploadTracker.current.showingPersistent = false;
      toast.dismiss(REFERENCE_UPLOAD_TOAST_ID);
    }
  }, [active, showUpload, captureVersion]);

  function setAudioPreference(preference: AudioPreference, value: boolean) {
    if (!active) return;
    setPreferences(current => ({ ...current, owner: active.owner, [preference]: value }));
    try { localStorage.setItem(`${audioPreferenceKeys[preference]}:${active.owner}`, value ? "on" : "off"); } catch { /* Session-only preference. */ }
  }
  useEffect(() => {
    function warn(event: BeforeUnloadEvent) {
      if (active?.outbox.state.pending || active?.captures.pendingUploads) { event.preventDefault(); event.returnValue = ""; }
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [active]);

  return <Context.Provider value={active && preferences.owner === active.owner ? { api: active.api, referenceApi: active.referenceApi, outbox: active.outbox,
    captures: active.captures, state, analyze: preferences.analyze, retain: preferences.retain, setAudioPreference, captureVersion } : null}>
    {children}
  </Context.Provider>;
}

export function usePracticePersistence() { return useContext(Context); }
