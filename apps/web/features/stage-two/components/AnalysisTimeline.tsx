'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PracticeAnalysis } from '../persistence/practice-api';
import type { ComparisonView } from '../comparison/view';
import { columnWidth, wordColumnWidth, envelopePath, fitTimelineZoom, timelinePitchPath, timelineColumns, timelineTicks, type TimelineVoice } from '../comparison/timeline';
import { useAnalysisSelection } from '../comparison/AnalysisSelection';
import { usePlayingWord, type ComparisonPlayback } from '../comparison/use-playing-word';
import { phenomena, soundMarks, visibleSoundMarks } from '../sound/phenomena';
import type { PracticeLayer } from './PracticeLayers';
import styles from './AnalysisTimeline.module.css';
import { SoundBadge, SoundLink } from './SoundCue';

type VoiceName = 'reference' | 'yours';
const voices: VoiceName[] = ['reference', 'yours'];
const soundLaneHeight = 40;
const name = (voice: VoiceName) => voice === 'reference' ? 'Reference' : 'You';
const duration = (voice: TimelineVoice) => voice.duration === null ? 'unavailable' : `${Math.round(voice.duration)} ms`;
const prominence = (voice: TimelineVoice) => voice.prominence === null ? 'not evaluated' : `${voice.prominence.toFixed(2)}${voice.uncertain ? ' (uncertain)' : ''}`;

export function AnalysisTimeline({ view, data, layers, sentenceId, voiceControls = false, playback }: {
  view: ComparisonView; data: PracticeAnalysis | null; layers: PracticeLayer[]; sentenceId: string; voiceControls?: boolean;
  playback?: ComparisonPlayback;
}) {
  const columns = useMemo(() => timelineColumns(view, data), [view, data]);
  const marks = useMemo(() => visibleSoundMarks(soundMarks(view)), [view]);
  const { selected, select } = useAnalysisSelection(sentenceId);
  const playing = usePlayingWord(view, playback);
  const active = playing ?? selected;
  const [zoom, setZoom] = useState(.18), [shown, setShown] = useState<VoiceName[]>(voices);
  const [dragging, setDragging] = useState(false);
  const [labelMeasurements, setLabelMeasurements] = useState<{ words: string; widths: number[] } | null>(null);
  const wordsKey = JSON.stringify(columns.map(column => column.text));
  // Linking belongs to the outgoing boundary, not both words in its span.
  const columnMarks = columns.map((_, index) => phenomena.filter(p => marks.some(m => m.kind === p.id
    && index >= m.start && index < m.end - (p.id === 'linking' ? 1 : 0))));
  const labelWidths = columns.map((column, index) => Math.max(
    labelMeasurements?.words === wordsKey ? labelMeasurements.widths[index] : column.text.length * 16,
    columnMarks[index].length * 36));
  useEffect(() => {
    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      const context = document.createElement('canvas').getContext('2d');
      if (!context) return;
      // Use the largest word-label size in all three views so toggling layers
      // never changes the word axis. Re-measure when the actual font is ready.
      context.font = `400 16px ${getComputedStyle(document.body).fontFamily}`;
      const words: string[] = JSON.parse(wordsKey);
      setLabelMeasurements({ words: wordsKey, widths: words.map(word => context.measureText(word).width) });
    };
    measure();
    void document.fonts.ready.then(measure);
    return () => { cancelled = true; };
  }, [wordsKey]);
  const scroll = useRef<HTMLDivElement>(null), buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const drag = useRef<{ x: number; left: number; moved: boolean; id: number } | null>(null);
  const suppressClick = useRef(false);
  const hasReference = columns.some(c => c.reference.duration !== null);
  const activeVoices = voices.filter(v => shown.includes(v) && (v === 'yours' || hasReference));
  const visibleVoices = activeVoices.length ? activeVoices : ['yours'] as VoiceName[];
  const sound = layers.includes('sound'), rhythm = layers.includes('rhythm'), melody = layers.includes('melody');
  const width = columns.reduce((sum, c, i) => sum + columnWidth(c, zoom, labelWidths[i]), 0);
  const ticks = visibleVoices.length === 1 ? timelineTicks(columns, zoom, labelWidths, visibleVoices[0]) : [];
  const soundHeight = 28 + visibleVoices.length * soundLaneHeight, rhythmHeight = visibleVoices.length * 64;
  const maxProminence = .88;
  const energies = columns.flatMap(c => voices.flatMap(v => c[v].frames.flatMap(f => f.energy === null ? [] : [f.energy])));
  const peak = Math.max(-120, ...energies);
  const selectedColumn = selected === null ? null : columns[selected];
  useEffect(() => {
    if (active === null) return;
    const box = scroll.current, button = buttons.current[active];
    if (!box || !button) return;
    const left = (button.parentElement?.offsetLeft ?? 0) + button.offsetLeft;
    const right = left + button.offsetWidth;
    if (left < box.scrollLeft) box.scrollLeft = left;
    else if (right > box.scrollLeft + box.clientWidth) box.scrollLeft = right - box.clientWidth;
  }, [active]);
  function fit() {
    setZoom(fitTimelineZoom(columns, labelWidths, scroll.current?.clientWidth ?? 0));
    if (scroll.current) scroll.current.scrollLeft = 0;
  }
  const toggleVoice = (voice: VoiceName) => setShown(current => {
    const valid = current.filter(v => v === 'yours' || hasReference);
    return valid.includes(voice) ? valid.length > 1 ? valid.filter(v => v !== voice) : valid : [...valid, voice];
  });
  const endDrag = () => { suppressClick.current = Boolean(drag.current?.moved); drag.current = null; setDragging(false); };
  if (!layers.length) return <div className={styles.empty}>Turn on at least one layer to see it here.</div>;
  return <section className={styles.root} aria-label="Analysis timeline">
    {voiceControls ? <div className={styles.voices} role="group" aria-label="Voices"><span className={styles.mono}>Voices</span>
      {voices.map(v => <button className="analysis-chip" key={v} type="button" aria-pressed={visibleVoices.includes(v)} disabled={v === 'reference' && !hasReference}
        onClick={() => toggleVoice(v)}>{name(v)}</button>)}
    </div> : null}
    <div className={styles.legend}>{!hasReference ? <span style={{opacity:.4}}><i className={styles.reference}/>Reference · unavailable</span> : null}{visibleVoices.map(v => <span key={v}><i className={v === 'reference' ? styles.reference : undefined}/>{name(v)}</span>)}</div>
    <div className={styles.toolbar}>
      <div className={styles.zoom} role="group" aria-label="Timeline zoom"><output className={styles.mono}>{Math.round(zoom / .18 * 100)}%</output>
        <button type="button" aria-label="Zoom out" disabled={zoom <= .06} onClick={() => setZoom(z => Math.max(.06, z - .03))}>−</button>
        <input type="range" min="0.06" max="0.6" step="0.005" value={zoom} aria-label="Timeline zoom" onChange={e => setZoom(Number(e.target.value))}/>
        <button type="button" aria-label="Zoom in" disabled={zoom >= .6} onClick={() => setZoom(z => Math.min(.6, z + .03))}>+</button>
        <button type="button" onClick={fit}>Fit</button>
      </div>
    </div>
    {!columns.length ? <div className={styles.empty}>Word timing is unavailable for this take.</div> : <div className={styles.chart}>
      <div className={styles.labels} aria-hidden="true"><div className={styles.ruler}/>
        {sound ? <div className={styles.label} style={{ height: soundHeight }}>Sound{visibleVoices.map((v, i) => <small key={v} style={{ top: 48 + i * soundLaneHeight }}>{v === 'reference' ? 'Ref' : 'You'}</small>)}</div> : null}
        {rhythm ? <div className={styles.label} style={{ height: rhythmHeight }}>Rhythm{visibleVoices.map((v, i) => <small key={v} style={{ top: 40 + i * 64 }}>{v === 'reference' ? 'Ref' : 'You'}</small>)}</div> : null}
        {melody ? <div className={styles.label} style={{ height:112, paddingTop:46 }}>Melody<small className={styles.axisTop}>+12</small><small className={styles.axisZero}>0</small><small className={styles.axisBottom}>−12</small></div> : null}
      </div>
      <div className={styles.scroll} ref={scroll} data-dragging={dragging} tabIndex={0} role="region" aria-label="Scrollable word timeline"
        onPointerDown={e => { if (e.pointerType === 'touch' || e.button !== 0) return; suppressClick.current = false; drag.current = { x:e.clientX, left:e.currentTarget.scrollLeft, moved:false, id:e.pointerId }; }}
        onPointerMove={e => { const d = drag.current; if (!d || d.id !== e.pointerId) return; const delta = e.clientX - d.x;
          if (Math.abs(delta) > 4) { d.moved = true; setDragging(true); e.currentTarget.setPointerCapture(e.pointerId); }
          if (d.moved) { e.preventDefault(); e.currentTarget.scrollLeft = d.left - delta; } }}
        onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={() => { if (drag.current) endDrag(); }}
        onPointerLeave={() => { if (drag.current && !drag.current.moved) endDrag(); }}
        onClickCapture={e => { if (suppressClick.current) { e.preventDefault(); e.stopPropagation(); suppressClick.current = false; } }}>
        <div className={styles.canvas} style={{ width }}>
          <div className={styles.ruler} aria-label="Recording time ruler">{ticks.map(tick => <span key={tick.second} style={{ left:tick.left }}>{tick.second}s</span>)}</div>
          <div className={styles.columns}>{columns.map((column, index) => {
            const px = columnWidth(column, zoom, labelWidths[index]);
            const wordPx = wordColumnWidth(column, zoom, labelWidths[index]);
            const tags = columnMarks[index];
            const pauses = visibleVoices.flatMap(v => column[v].pause ? [`${name(v)} pause ${(column[v].pause! / 1000).toFixed(2)} s`] : []);
            return <div key={index} className={styles.slot} style={{width:px}}>
            <button type="button" ref={el => { buttons.current[index] = el; }} className={styles.column} style={{ width:wordPx }} aria-pressed={selected === index} data-playing={playing === index}
              aria-label={`Compare ${column.text}, word ${index + 1}`} onClick={() => select(index)} title={column.text}
              onKeyDown={e => { const next = e.key === 'ArrowRight' ? Math.min(index + 1, columns.length - 1) : e.key === 'ArrowLeft' ? Math.max(0, index - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? columns.length - 1 : null;
                if (next !== null) { e.preventDefault(); select(next); buttons.current[next]?.focus({ preventScroll:true }); } }}>
              {sound ? <span className={styles.sound} style={{ height:soundHeight }}><span className={styles.word}>{column.text}</span>
                {visibleVoices.map(v => <span key={v} className={styles.tags} style={{height:soundLaneHeight}} data-sound-voice={v}>
                  {tags.filter(p => p.id !== 'linking').map(p => <SoundBadge key={p.id} kind={p.id} uncertain={v === 'yours'} evidence="target"
                    title={`${p.label}: ${v === 'yours' ? 'not evaluated in your voice' : 'possible reading'}`}/>)}
                  {tags.some(p => p.id === 'linking') ? <SoundLink uncertain={v === 'yours'}/> : null}
                </span>)}
              </span> : null}
              {rhythm ? <span className={styles.rhythm} style={{width:px}}>{visibleVoices.map(v => {
                const evidence = column[v], laneWidth = (evidence.duration ?? 0) * zoom, barWidth = Math.min(28, Math.max(3, laneWidth * .38));
                return <span key={v} className={styles.lane} data-voice={v}>
                  <svg className={styles.envelope} width={laneWidth + evidence.gap * zoom} height="52" aria-hidden="true"><path d={envelopePath(evidence.frames, zoom, peak)}/></svg>
                  <span className={styles.baseline} style={{width:laneWidth}}/>
                  {evidence.gap > 0 ? <span className={styles.boundary} data-pause={Boolean(evidence.pause)} style={{left:laneWidth,width:evidence.gap * zoom}} title={evidence.pause ? `Pause · ${Math.round(evidence.pause)} ms` : 'Continuous word boundary'}/> : null}
                  {evidence.prominence !== null ? <span className={styles.bar} data-uncertain={evidence.uncertain} style={{ height:Math.min(maxProminence, Math.max(0,evidence.prominence)) / maxProminence * 52, width:barWidth, left:Math.max(0,(laneWidth-barWidth)/2) }}/> : null}
                </span>;
              })}</span> : null}
              {melody ? <span className={styles.melody} style={{width:px}}/> : null}
              {!sound ? <span className={styles.word}>{column.text}</span> : null}
            </button>
            {px - wordPx >= 72 && pauses.length ? <span className={styles.pauseLabel} style={{left:wordPx,width:px-wordPx}} title={pauses.join(' · ')}>{visibleVoices.length === 1 ? `Pause ${(column[visibleVoices[0]].pause! / 1000).toFixed(2)} s` : 'Pause'}</span> : null}
            </div>;
          })}</div>
          {melody ? <svg className={styles.pitchPlot} width={width} height="112" style={{top:24 + (sound ? soundHeight : 0) + (rhythm ? rhythmHeight : 0)}} aria-hidden="true">
            {visibleVoices.map(v => <path key={v} data-voice={v} d={timelinePitchPath(columns,v,zoom,labelWidths)}/>)}</svg> : null}
        </div>
      </div>
    </div>}
    {selectedColumn && layers.length ? <div className={styles.readout} aria-live="polite"><strong>{selectedColumn.text}</strong>
      {visibleVoices.map(v => { const evidence = selectedColumn[v], pitches = evidence.frames.filter(f => f.time * 1000 < (evidence.duration ?? 0)).flatMap(f => f.pitch === null ? [] : [f.pitch]);
        return <span key={v}><b>{name(v)}</b> {duration(evidence)} · prominence {prominence(evidence)}{visibleVoices.length === 1 && pitches.length ? ` · pitch ${Math.min(...pitches).toFixed(1)}–${Math.max(...pitches).toFixed(1)} st` : ''}{evidence.pause ? ` · pause ${Math.round(evidence.pause)} ms` : ''}</span>; })}
      {visibleVoices.length === 2 && selectedColumn.reference.duration !== null && selectedColumn.yours.duration !== null ? <span>Δ You − Reference {Math.round(selectedColumn.yours.duration - selectedColumn.reference.duration)} ms</span> : null}
      {phenomena.filter(p => marks.some(m => m.kind === p.id && selectedColumn.index >= m.start && selectedColumn.index < m.end)).map(p => <span key={p.id} className="sound-inline-badge" data-phenomenon={p.id} title={p.label}>{p.badge}</span>)}
    </div> : null}
  </section>;
}
