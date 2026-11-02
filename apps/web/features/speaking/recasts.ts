import type { ConversationQuote, ConversationRecast, SpeakingMessage } from "@libitu/types/speaking";

function boundary(text: string, index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index <= text.length
    && !(index > 0 && index < text.length && /[\uD800-\uDBFF]/u.test(text[index - 1]) && /[\uDC00-\uDFFF]/u.test(text[index]));
}
export function validRecastReference(ref: ConversationQuote | null, messages: SpeakingMessage[], role: "user" | "assistant"): boolean {
  if (!ref) return false;
  const message = messages.find(value => value.id === ref.message_id && value.revision === ref.revision && value.role === role && value.status === "final");
  return !!message && boundary(message.text, ref.start) && boundary(message.text, ref.end) && ref.end > ref.start && message.text.slice(ref.start, ref.end) === ref.quote;
}
export function validChangedSpans(text: string, spans: ConversationRecast["changed_spans"]): boolean {
  let cursor = 0;
  return spans.every(span => {
    const valid = boundary(text, span.start) && boundary(text, span.end) && span.end > span.start && span.start >= cursor && text.slice(span.start, span.end) === span.quote;
    cursor = span.end; return valid;
  });
}
export function validRecasts(recasts: ConversationRecast[] | undefined, messages: SpeakingMessage[]): ConversationRecast[] {
  return (recasts ?? []).filter(recast => {
    if (recast.status !== "ready" || !validRecastReference(recast.source, messages, "user") || !validRecastReference(recast.delivery, messages, "assistant") || !validChangedSpans(recast.replacement, recast.changed_spans)) return false;
    let cursor = 0, result = "";
    for (const edit of recast.edits) {
      if (!boundary(recast.source.quote, edit.start) || !boundary(recast.source.quote, edit.end) || edit.start < cursor || edit.end < edit.start || recast.source.quote.slice(edit.start, edit.end) !== edit.before) return false;
      result += recast.source.quote.slice(cursor, edit.start) + edit.after; cursor = edit.end;
    }
    return recast.edits.length > 0 && result + recast.source.quote.slice(cursor) === recast.replacement;
  });
}
