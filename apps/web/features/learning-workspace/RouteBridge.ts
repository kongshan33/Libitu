"use client";
import { useCallback, useEffect, useTransition } from "react";
import type { StageOneBlueprint } from "@libitu/types/stage-one";
import { parseLearningLocation, workspaceHref } from "../navigation/learning-location";
import { useCurrentLocation } from "../navigation/use-current-location";
import type { WorkspaceView } from "./ContentWorkspaceProvider";
import { useRoutePrefetch } from "../navigation/use-route-prefetch";
import { resolveHistoricalSentence } from "./historical-sentence";
import { STAGE_TWO_LOCATION_CHANGED } from "../stage-two/location";

export function useWorkspaceRoute(blueprint: StageOneBlueprint | null) {
  const href = useCurrentLocation();
  const warm = useRoutePrefetch();
  const [isNavigating, startNavigation] = useTransition();
  const location = parseLearningLocation(new URL(href, "https://libitu.invalid"));
  const stageOneView: WorkspaceView = location.kind === "shadow" ? "shadow" : location.kind === "segments" ? location.step === "prepare" ? "shadow" : "picker" : "reader";
  const selectedSegmentId = "segmentId" in location ? location.segmentId ?? null : null;
  const navigate = useCallback((view: WorkspaceView, segmentId?: string, sentenceId?: string, replace = false, detailed = false) => {
    const target = workspaceHref(new URL(window.location.href), view, segmentId, sentenceId) + (detailed ? "&shadowMode=detailed" : "");
    if (target !== window.location.pathname + window.location.search + window.location.hash) {
      // All three routes render StageOneReader under the same content provider.
      // Keep this loaded workspace and media alive instead of waiting for RSC.
      startNavigation(() => {
        window.history[replace ? "replaceState" : "pushState"](null, "", target);
        window.dispatchEvent(new Event(STAGE_TWO_LOCATION_CHANGED));
      });
    }
    return target;
  }, []);
  const prefetch = useCallback((view: WorkspaceView, segmentId?: string, sentenceId?: string) => {
    warm(workspaceHref(new URL(window.location.href), view, segmentId, sentenceId));
  }, [warm]);
  useEffect(() => {
    if (!blueprint) return;
    if (stageOneView === "reader" && blueprint.segments.some(segment => typeof segment.startMs === "number" && typeof segment.endMs === "number" && segment.endMs > segment.startMs)) prefetch("picker");
    else if (stageOneView === "picker" && selectedSegmentId) prefetch("shadow", selectedSegmentId);
    if (stageOneView !== "reader") prefetch("reader");
  }, [blueprint, stageOneView, selectedSegmentId, prefetch]);
  const unresolvedSentence = location.kind === "shadow" && !location.segmentId ? location.sentenceId : undefined;
  const historicalText = new URL(href, "https://libitu.invalid").searchParams.get("sentenceText");
  useEffect(() => {
    if (!blueprint || !unresolvedSentence) return;
    const selected = resolveHistoricalSentence(blueprint, unresolvedSentence, historicalText);
    if (selected) navigate("shadow", selected.segmentId, selected.id, true, true);
    else navigate("picker", undefined, undefined, true);
  }, [blueprint, unresolvedSentence, historicalText, navigate]);
  // Old preparation links remain usable, without adding another history entry.
  const legacyPreparation = location.kind === "segments" && location.step === "prepare";
  useEffect(() => {
    if (!legacyPreparation || !blueprint || !selectedSegmentId) return;
    if (blueprint.segments.some(segment => segment.id === selectedSegmentId && typeof segment.startMs === "number" && typeof segment.endMs === "number" && segment.endMs > segment.startMs)) {
      navigate("shadow", selectedSegmentId, undefined, true);
    }
  }, [legacyPreparation, blueprint, selectedSegmentId, navigate]);
  const setSelectedSegmentId = useCallback((segmentId: string | null) => {
    navigate(stageOneView, segmentId ?? undefined, undefined, true);
  }, [navigate, stageOneView]);
  useEffect(() => {
    if (!blueprint || !selectedSegmentId) return;
    if (!blueprint.segments.some(segment => segment.id === selectedSegmentId && typeof segment.startMs === "number" && typeof segment.endMs === "number" && segment.endMs > segment.startMs)) navigate("reader", undefined, undefined, true);
  }, [blueprint, selectedSegmentId, navigate]);
  return { stageOneView, selectedSegmentId, setSelectedSegmentId, navigate, prefetch, isNavigating };
}
