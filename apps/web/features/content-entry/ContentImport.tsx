"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { FlowNavigation } from "@/components/FlowNavigation";
import { ReaderLoadingShell } from "../stage-one/components/ReaderSkeleton";
import styles from "./ContentImport.module.css";
import { CONTENT_ID, canonicalVideoSource, learningHref, type LearningLocation } from "../navigation/learning-location";
import { resolveLearningSource } from "../stage-one/api/stage-one-api";

/** Consume transient captions before mounting any content media resources. */
export function ContentImport({ location }: { location: LearningLocation }) {
  const router = useRouter();
  const [attempt, retry] = useState(0);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (location.kind !== "import") return;
    const controller = new AbortController();
    void (async () => {
      await Promise.resolve();
      if (controller.signal.aborted) return;
      setError(null);
      try {
        const source = location.source;
        const result = await resolveLearningSource({ ...source, kind: "youtube", sourceUrl: source.sourceUrl!, title: source.title ?? "", learnerLevel: source.learnerLevel ?? "B1" }, controller.signal);
        if (!CONTENT_ID.test(result.content_id) || canonicalVideoSource(result.source_url ?? "") !== source.sourceUrl) throw new Error("The resolved content does not match this video.");
        if (!controller.signal.aborted) router.replace(learningHref({ contentId: result.content_id, learnerLevel: source.learnerLevel }));
      } catch (error) {
        if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Unable to open this video.");
      }
    })();
    return () => controller.abort();
  }, [location, attempt, router]);
  const message = location.kind === "invalid" ? location.message : error;
  if (!message) return <ReaderLoadingShell />;
  return <main className="stage-page">
    <FlowNavigation title="Opening your workspace…" current={0} steps={[{ label: "Ingest" }, { label: "Shadow" }]} />
    <section className={`${styles.error} ui-retry-notice`} aria-labelledby="import-error-title">
      <h1 id="import-error-title">Unable to open this video</h1>
      <p role="alert">{message}</p>
      <div className="ui-retry-actions">
        {error && <Button variant="secondary" size="md" onClick={() => { setError(null); retry(value => value + 1); }}>Retry</Button>}
        <ButtonLink variant="secondary" size="md" href="/">Choose a video</ButtonLink>
      </div>
    </section>
  </main>;
}
