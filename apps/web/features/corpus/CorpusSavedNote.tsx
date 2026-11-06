import { RestrictedMarkdown } from "./CorpusMarkdown";
import styles from "./CorpusDetail.module.css";

export function CorpusSavedNote({ note }: { note?: string }) {
  return note?.trim() ? <section className={styles.savedNote} aria-label="My note">
    <h3>My note</h3>
    <RestrictedMarkdown text={note} />
  </section> : null;
}
