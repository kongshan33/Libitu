import { notFound } from "next/navigation";
import { ConversationPreview } from "@/features/speaking/preview/ConversationPreview";

export const dynamic = "force-dynamic";

export default function ConversationPreviewPage() {
  // Explicit opt-in on the server. Never bypass session auth with a query flag.
  if (process.env.LIBITU_CONVERSATION_PREVIEW !== "1") notFound();
  return <ConversationPreview />;
}
