import { Suspense, type ReactNode } from "react";
import { notFound } from "next/navigation";
import { CONTENT_ID } from "@/features/navigation/learning-location";
import { ContentWorkspaceProvider } from "@/features/learning-workspace/ContentWorkspaceProvider";
import { ContentWorkspaceLoading } from "@/features/learning-workspace/ContentWorkspaceLoading";
// Workspace views can switch without requesting another route stylesheet.
import "@/features/stage-two/quick/QuickShadowing.module.css";
import "@/features/stage-two/components/StageTwoPractice.module.css";
import "@/features/stage-two/components/PracticeAnalysisPanel.module.css";
import "@/features/stage-two/components/LayerAnalysis.module.css";
import "@/features/stage-two/components/AnalysisTimeline.module.css";
export default async function ContentLayout({ params, children }: { params: Promise<{ contentId: string }>; children: ReactNode }) {
  const { contentId } = await params;
  if (!CONTENT_ID.test(contentId)) notFound();
  return <Suspense fallback={<ContentWorkspaceLoading />}><ContentWorkspaceProvider key={contentId}>{children}</ContentWorkspaceProvider></Suspense>;
}
