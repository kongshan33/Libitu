import type { PracticeAnalysis, PracticeAttempt } from './practice-api';

export function takeAnalysisStatus(take: PracticeAttempt, selected?: PracticeAnalysis | null) {
  const state = selected?.id === take.id ? selected.state : take.analysis_state;
  const scope = selected?.id === take.id ? selected.analysis_scope : take.analysis_scope;
  switch (state) {
    case 'completed': return scope === 'none' ? 'Word check saved' : 'Analyzed';
    case 'needs_review': return 'Needs review';
    case 'awaiting_upload': return 'Waiting for audio';
    case 'queued': return 'Queued';
    case 'processing': return 'Analyzing…';
    case 'failed': return 'Analysis failed';
    case 'cancelled': return 'Analysis cancelled';
    case 'deleted': return 'Analysis deleted';
    default: return 'Not analyzed';
  }
}
