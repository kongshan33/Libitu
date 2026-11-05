import styles from './LayerAnalysis.module.css';
import type { ComparisonView } from '../comparison/view';
import type { Phenomenon } from '../sound/phenomena';
import type { PracticeLayer } from './PracticeLayers';

const soundTips: Record<Phenomenon | 'all', string> = {
  all: 'Choose a phenomenon above, listen to its marked words, then replay your voice and compare.',
  linking: 'Listen across the marked word boundary. Practice the two words together, then return to the whole sentence.',
  weak_form: 'Listen to how much time the reference gives the marked function word. Try it within the full phrase.',
  flap: 'Replay the marked word slowly, then practice it at the reference pace. Listen for the brief consonant contact.',
  elision: 'Listen to the consonant cluster in context. A possible omission is a listening cue, not a required change.',
  assimilation: 'Replay the neighboring sounds together and notice how the transition feels in the full phrase.',
  glottal: 'Listen closely to the consonant boundary. This view does not yet identify glottal realizations.',
  drop_d: 'Listen to the final consonant in its phrase. A missing detector does not mean your pronunciation is wrong.',
  h_drop: 'Compare the beginning of the word in context. H-dropping is not automatically evaluated here.',
  vowel_length: 'Compare the marked vowel durations at a similar speaking pace. Duration alone does not establish vowel quality.',
  voicing: 'Listen to the consonant and its surrounding vowel together. Voicing is not automatically evaluated here.',
};

export function LayerFocus({ id, layer, view, soundFilter = 'all', concealed = false }: {
  id?: string; layer: PracticeLayer; view: ComparisonView; soundFilter?: Phenomenon | 'all'; concealed?: boolean;
}) {
  const label = layer === 'sound' ? 'Sound' : layer === 'rhythm' ? 'Rhythm' : 'Melody';
  const candidates = (view.sound?.candidates ?? []).filter(c => soundFilter === 'all' || c.kind === soundFilter);
  return <aside id={id} className={styles.notes} aria-label={`${label} notes`}>
    <section aria-label={`${label} feedback`}>
      <h3>Feedback</h3>
      {layer === 'sound' ? <>
        {!concealed && candidates.length ? <ul>{candidates.map(c => <li key={c.id}>
          <strong>{c.source_text}</strong> {c.explanation}
        </li>)}</ul> : null}
        {!concealed && !candidates.length ? <p>Colored marks suggest possible readings. Your voice’s “?” marks are not yet evaluated.</p> : null}
        {concealed ? <p>Reveal the text to see word-specific suggestions.</p> : null}
      </> : <p>{layer === 'rhythm'
        ? 'Bars show continuous relative prominence. Light envelopes show loudness; dashed bars indicate boundary sensitivity. These measurements are not calibrated stress grades.'
        : view.wordAligned ? 'The curves share a word axis and each voice’s median pitch is the baseline. Highlight a word to compare its curve interval. Nuclear stress is not evaluated.'
          : 'Word timing is not available. Missing evidence stays empty until analysis completes.'}</p>}
      {layer !== 'sound' ? [view.reference, view.yours].map((voice, i) => voice.status ? <p key={i}><strong>{i ? 'Your voice' : 'Reference'}:</strong> {voice.status}</p> : null) : null}
    </section>
    <section aria-label={`${label} practice tip`}>
      <h3>Tip</h3>
      <p>{layer === 'sound' ? soundTips[soundFilter] : layer === 'rhythm'
        ? 'Listen to one phrase at a time. Follow its pace and pauses, then record the whole sentence again.'
        : 'Listen for the direction of the pitch movement. Follow the shape of the reference without trying to copy its absolute pitch.'}</p>
    </section>
  </aside>;
}
