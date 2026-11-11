import styles from './LayerAnalysis.module.css';
import type { ComparisonView } from '../comparison/view';
import { phenomenon, type Phenomenon } from '../sound/phenomena';
import { SoundNotes } from './SoundExplorer';
import type { PracticeLayer } from './PracticeLayers';

export function LayerFocus({ id, layer, view, soundFilter = 'all', concealed = false }: {
  id?: string; layer: PracticeLayer; view: ComparisonView; soundFilter?: Phenomenon | 'all'; concealed?: boolean;
}) {
  const label = layer === 'sound' ? 'Sound' : layer === 'rhythm' ? 'Rhythm' : 'Melody';
  return <aside id={id} className={styles.notes} aria-label={`${label} notes`}>
    <section aria-label={`${label} feedback`}>
      <h3>Feedback</h3>
      {layer === 'sound' ? <><SoundNotes view={view} concealed={concealed}/></> : <p>{layer === 'rhythm'
        ? 'Bars show continuous relative prominence. Light envelopes show loudness; dashed bars indicate boundary sensitivity. These measurements are not calibrated stress grades.'
        : view.wordAligned ? 'The curves share a word axis and each voice’s median pitch is the baseline. Highlight a word to compare its curve interval. Nuclear stress is not evaluated.'
          : 'Word timing is not available. Missing evidence stays empty until analysis completes.'}</p>}
      {layer !== 'sound' ? [view.reference, view.yours].map((voice, i) => voice.status ? <p key={i}><strong>{i ? 'Your voice' : 'Reference'}:</strong> {voice.status}</p> : null) : null}
    </section>
    <section aria-label={`${label} practice tip`}>
      <h3>Tip</h3>
      <p>{layer === 'sound' ? (soundFilter==='all'?'Select a word to read the conditions, listen, then practice it in the full phrase.':phenomenon(soundFilter).practice) : layer === 'rhythm'
        ? 'Listen to one phrase at a time. Follow its pace and pauses, then record the whole sentence again.'
        : 'Listen for the direction of the pitch movement. Follow the shape of the reference without trying to copy its absolute pitch.'}</p>
    </section>
  </aside>;
}
