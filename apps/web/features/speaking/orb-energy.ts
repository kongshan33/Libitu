/** Meter getters already enforce connected playback / microphone permission. */
export function readOrbEnergy(phase: string, output?: () => number, input?: () => number): number {
  if (phase === "idle" || phase === "connecting") return 0;
  const bounded = (value: number) => Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
  // Do not wait for server VAD: the first syllable and interruptions must show up.
  return Math.max(bounded(output?.() ?? 0), bounded(input?.() ?? 0));
}

/** Four normalized visual bands: bass, speech, high frequencies, RMS envelope. */
export type OrbBands = Float32Array;
export type OrbMeters = {
  getOutputLevel?: () => number; getInputLevel?: () => number;
  getOutputBands?: () => OrbBands; getInputBands?: () => OrbBands;
};

/** Reuses the destination each frame; stale/invalid samples never reach GLSL. */
export function smoothOrbBands(destination: OrbBands, source: OrbBands | undefined, level: number, dt: number): void {
  for (let i=0;i<4;i++) {
    const raw=source?.[i] ?? level;
    const target=Number.isFinite(raw) ? Math.max(0,Math.min(1,raw)) : 0;
    destination[i]+=(target-destination[i])*(1-Math.exp(-dt/(target>destination[i] ? 28 : 160)));
  }
}

/** Average actual FFT bins in Hz, bounded by Nyquist (including low sample rates). */
export function visualFrequencyBands(frequencies: Uint8Array, sampleRate: number, level: number, result: OrbBands): OrbBands {
  result.fill(0);
  if (!Number.isFinite(level)||level<=0||!frequencies.length||!Number.isFinite(sampleRate)||sampleRate<=0) return result;
  const edges=[0,200,2000,20000], hzPerBin=sampleRate/(frequencies.length*2);
  for (let band=0;band<3;band++) {
    const start=Math.min(frequencies.length,Math.ceil(edges[band]/hzPerBin));
    const end=Math.min(frequencies.length,Math.ceil(edges[band+1]/hzPerBin));
    let sum=0;
    for(let i=start;i<end;i++) sum+=frequencies[i]/255;
    result[band]=end>start ? Math.min(1,Math.sqrt(sum/(end-start))*1.5) : 0;
  }
  result[3]=Math.min(1,level);
  return result;
}
