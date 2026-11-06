// Deliberately tiny Markdown subset. React escapes HTML; links/images are never rendered.
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part.startsWith("`") && part.endsWith("`") ? <code key={i}>{part.slice(1, -1)}</code> : part);
}
export function RestrictedMarkdown({ text }: { text: string }) {
  return <div>{text.split(/\n\s*\n/).filter(Boolean).map((block, i) => block.split("\n").every(line => /^[-*] /.test(line)) ? <ul key={i}>{block.split("\n").map((line, j) => <li key={j}>{inline(line.slice(2))}</li>)}</ul> : <p key={i} style={{ whiteSpace: "pre-wrap" }}>{inline(block)}</p>)}</div>;
}
