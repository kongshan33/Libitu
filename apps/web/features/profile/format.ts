import type { HistoryItem } from "./types";
import { CONTENT_ID, learningHref } from "../navigation/learning-location.ts";

export function recordedDuration(milliseconds: number): string {
  const seconds = Math.floor(Math.max(0, milliseconds) / 1000);
  if (!seconds && milliseconds > 0) return "<1s";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return minutes < 60 ? `${minutes}m ${seconds % 60}s` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function historyHref(item: HistoryItem): string | null {
  if (item.kind === "speaking" && item.session_id && item.status === "completed" && item.feedback?.unavailable_reason !== "legacy_report") return `/speaking/${encodeURIComponent(item.session_id)}/analytics`;
  if (item.kind === "speaking" && item.session_id) return `/speaking/${encodeURIComponent(item.session_id)}?returnTo=%2Fprofile`;
  // Resolve the historical sentence against the current blueprint in the workspace.
  if (item.kind === "shadowing" && item.content_id && CONTENT_ID.test(item.content_id)
    && item.sentence_id && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,249}$/.test(item.sentence_id)) {
    const params = new URLSearchParams({ sentenceId: item.sentence_id });
    if (item.title) params.set("sentenceText", item.title);
    return `/practice/${item.content_id}/shadow?${params}`;
  }
  if ((item.kind === "shadowing" || item.kind === "video") && item.content_id) return profileSourceHref(item.content_id, item.source_url);
  return null;
}

export function historyAction(item: HistoryItem): string {
  if (!historyHref(item)) return "Source unavailable";
  if (item.kind === "video") return "Open Stage 1";
  if (item.kind === "shadowing") return historyHref(item)?.includes("/shadow?") ? "Open Shadow" : "View source";
  if (item.status !== "completed") return item.status === "active" ? "Continue" : "View conversation";
  const report = item.feedback;
  if (report?.unavailable_reason === "legacy_report") return "View conversation";
  if (report?.available) return report.status === "partial" ? "Partial report" : "View report";
  if (report?.unavailable_reason === "version_mismatch") return "View earlier report";
  if (report?.unavailable_reason === "invalid_result") return "Check report";
  return report ? ({ queued: "Report queued", processing: "Report in progress", failed: "Report needs retry", insufficient_data: "Limited evidence", partial: "Partial report", ready: "View report" })[report.status] : "View report";
}

export function profileSourceHref(contentId: string, _sourceUrl: string | null | undefined): string | null {
  void _sourceUrl; // Display metadata cannot override the server-owned content source.
  return CONTENT_ID.test(contentId) ? learningHref({ contentId }) : null;
}

export function activityDate(value: string, month = false): string {
  return new Date(`${value}T12:00:00Z`).toLocaleDateString("en", {
    timeZone: "UTC", month: "short", ...(month ? { year: "numeric" } : { day: "numeric" })
  });
}
