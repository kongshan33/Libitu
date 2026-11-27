'use client';
import { useState } from 'react';
import { SegmentedControl } from '@/components/ui/Tabs';
import { AnalysisSelection } from '../comparison/AnalysisSelection';
import { useAuth } from '@clerk/nextjs';
import { useCurrentLocation } from '../../navigation/use-current-location';
import { StageTwoDetailed, type StageTwoProps } from './StageTwoDetailed';
import { QuickShadowing } from '../quick/QuickShadowing';
import styles from '../quick/QuickShadowing.module.css';

export type ShadowMode = 'quick' | 'detailed' | 'review';
export function StageTwoShadowing(props: StageTwoProps) {
  const {userId} = useAuth();
  const [playbackRate, setPlaybackRate] = useState(1);
  const href = useCurrentLocation();
  const value = new URL(href, 'https://libitu.invalid').searchParams.get('shadowMode');
  const mode: ShadowMode = value === 'detailed' || value === 'review' ? value : 'quick';
  function changeMode(next: ShadowMode) {
    const url = new URL(window.location.href);
    url.searchParams.set('shadowMode', next);
    window.history.replaceState(null, '', url);
    window.dispatchEvent(new Event('libitu:stage-two-location'));
  }
  const tabs = <SegmentedControl
    as="nav"
    ariaLabel="Shadow mode"
    className={styles.modes}
    items={[
      { value: 'quick', label: 'Quick' },
      { value: 'detailed', label: 'Detailed' },
      { value: 'review', label: 'Review' }
    ]}
    value={mode}
    onValueChange={changeMode}
  />;
  return <AnalysisSelection>
    {mode === 'detailed' ? <StageTwoDetailed {...props} modes={tabs} rate={playbackRate} onRateChange={setPlaybackRate}/> : null}
    <QuickShadowing key={`${userId ?? 'anonymous'}:${props.contentId}:${props.segment.id}`} {...props} mode={mode} modes={tabs} onMode={changeMode} rate={playbackRate} onRateChange={setPlaybackRate}/>
  </AnalysisSelection>;
}
