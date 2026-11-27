import { useState } from 'react';
import { trace, type ComparisonView } from '../comparison/view';
import type { AcousticFeatures } from '../acoustics/types';
import type { SentenceMeasurement } from '../server-reference/api';
import { allSound, type SoundFilter } from '../sound/phenomena';
import { SoundComparison } from './SoundComparison';
import { AnalysisTimeline } from './AnalysisTimeline';
import { SignalCurve } from './ProgressiveComparison';
import type { PracticeLayer } from './PracticeLayers';
import { LayerHeading } from './LayerComparison';
import styles from './LayerAnalysis.module.css';

export function ReferenceLayer({ heading = false, ...props }: ReferenceProps & { heading?: boolean }) {
  // The learner comparison owns the heading when both are shown; never render two.
  if (!heading) return <ReferenceContent {...props}/>;
  return <section className={styles.layer} aria-label={`Reference ${props.layer}`}>
    <LayerHeading layer={props.layer} view={props.view}/>
    <div className={props.layer === 'sound' ? styles.soundWorkspace : undefined}><ReferenceContent {...props}/></div>
  </section>;
}
type ReferenceProps = {
  layer: PracticeLayer; view: ComparisonView; measurement: SentenceMeasurement | null;
  features: AcousticFeatures | null; status: string;
};
function ReferenceContent({ layer, view, measurement, features, status }: ReferenceProps) {
  const [filter, setFilter] = useState<SoundFilter>(allSound);
  const [concealed, setConcealed] = useState(false);
  if (layer === 'sound') return <SoundComparison referenceOnly view={view} filter={filter}
    onFilterChange={setFilter} concealed={concealed} onConcealedChange={setConcealed}/>;
  const signal = measurement?.prosody?.rhythm_signal ?? measurement?.coarse;
  if (measurement?.prosody?.rhythm_signal && view.wordAligned) {
    return <AnalysisTimeline view={view} data={null} layers={[layer]} sentenceId={measurement.sentence_id}
      referenceOnly referenceSignal={measurement.prosody.rhythm_signal}/>;
  }
  if (signal) {
    const values = layer === 'melody' ? signal.pitch_st : signal.prominence;
    const scale = values.reduce<number>((max, value) => Math.max(max, Math.abs(value ?? 0)), layer === 'melody' ? 2 : .1);
    return <SignalCurve signal={signal} layer={layer} scale={scale} label={layer === 'melody' ? 'Reference pitch (st)' : 'Reference relative prominence'}/>;
  }
  if (layer === 'melody' && view.reference.curve.some(point => point.pitch !== null)) {
    const extent = view.reference.curve.reduce((max, point) => Math.max(max, Math.abs(point.pitch ?? 0)), 2);
    return <figure className="stage-two-acoustic-chart">
      <figcaption>Reference pitch · relative to the speaker’s median (±{extent.toFixed(1)} st)</figcaption>
      <svg viewBox="0 0 600 184" role="img" aria-label="Reference pitch contour">
        <path d={trace(view.reference.curve, 8, 584, extent)} className="stage-two-chart-reference"/>
      </svg>
    </figure>;
  }
  if (layer === 'rhythm' && measurement && view.wordAligned) {
    return <AnalysisTimeline view={view} data={null} layers={[layer]} sentenceId={measurement.sentence_id} referenceOnly/>;
  }
  if (layer === 'rhythm' && features?.quality.status === 'usable' && features.speechSpanMs !== null) {
    return <p>Reference speaking span · {(features.speechSpanMs / 1000).toFixed(2)} s.
      Internal pauses · {features.pauseCount} ({(features.internalPauseDurationMs / 1000).toFixed(2)} s).</p>;
  }
  if (measurement?.status === 'completed' || features?.quality.status === 'insufficient') {
    return <p role="status">Insufficient reference evidence for {layer}.</p>;
  }
  return <p role="status">{status}</p>;
}
