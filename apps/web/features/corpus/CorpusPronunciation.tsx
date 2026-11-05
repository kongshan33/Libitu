"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Square, Volume2 } from "lucide-react";
import type { CorpusSelectionAnalysis } from "@libitu/types/stage-one";
import { Button } from "@/components/ui/button";
import styles from "./CorpusDetail.module.css";

export function CorpusPronunciation({ pronunciation, disabled, active }: {
  pronunciation: CorpusSelectionAnalysis["explanation"]["pronunciation"];
  disabled: boolean; active: boolean;
}) {
  const descriptionId = useId();
  const [status, setStatus] = useState<"idle" | "loading" | "playing">("idle");
  const [error, setError] = useState("");
  const audio = useRef<HTMLAudioElement | null>(null);
  const request = useRef<AbortController | null>(null);
  const cachedUrl = useRef<string | null>(null);
  const generation = useRef(0);

  function stop() {
    generation.current++;
    request.current?.abort(); request.current = null;
    if (audio.current) {
      audio.current.onended = null; audio.current.onerror = null;
      audio.current.pause(); audio.current.removeAttribute("src"); audio.current.load();
      audio.current = null;
    }
  }
  useEffect(() => {
    if (!active) { stop(); setStatus("idle"); }
    return stop;
  }, [active]);
  useEffect(() => () => {
    if (cachedUrl.current) URL.revokeObjectURL(cachedUrl.current);
  }, []);

  async function play() {
    if (status === "playing") { stop(); setStatus("idle"); return; }
    if (request.current || disabled || !active) return;
    stop();
    const current = generation.current;
    const controller = new AbortController(); request.current = controller;
    setStatus("loading"); setError("");
    try {
      if (!cachedUrl.current) {
        const base = (process.env.NEXT_PUBLIC_LIBITU_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");
        const response = await fetch(`${base}/api/corpus/speech`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: pronunciation.audioText }),
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(50_000)]),
        });
        if (!response.ok || !response.headers.get("content-type")?.startsWith("audio/")) throw new Error("Voice unavailable");
        const blob = await response.blob();
        if (controller.signal.aborted || generation.current !== current) return;
        if (!blob.size) throw new Error("Empty audio");
        cachedUrl.current = URL.createObjectURL(blob);
      }
      if (controller.signal.aborted || generation.current !== current) return;
      const player = new Audio(cachedUrl.current);
      audio.current = player;
      player.onended = () => setStatus("idle");
      player.onerror = () => {
        setStatus("idle"); setError("Voice could not play. Please retry.");
        if (cachedUrl.current) URL.revokeObjectURL(cachedUrl.current);
        cachedUrl.current = null;
      };
      await player.play();
      if (generation.current === current) setStatus("playing");
    } catch {
      if (generation.current === current) {
        setStatus("idle"); setError("Voice could not play. Please retry.");
      }
    } finally { if (generation.current === current) request.current = null; }
  }

  return <section>
    <div className={styles.pronunciationHeading}><h2>Pronunciation</h2>
      <Button variant="secondary" size="sm" disabled={disabled} loading={status === "loading"} loadingLabel="Loading"
        aria-describedby={descriptionId} onClick={() => void play()}>
        {status === "playing" ? <Square size={14} aria-hidden="true" /> : <Volume2 size={14} aria-hidden="true" />}
        {status === "playing" ? "Stop" : error ? "Retry" : "Play"}
      </Button>
    </div>
    <div className={styles.pronunciation}>
      <span>{pronunciation.ipa}</span>{pronunciation.stressText ? <span>{pronunciation.stressText}</span> : null}
    </div>
    <p id={descriptionId}><span className={styles.meta}>AI voice · </span>{pronunciation.connectedSpeech}</p>
    {error ? <p role="alert">{error}</p> : null}
  </section>;
}
