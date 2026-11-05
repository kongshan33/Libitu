"""20 ms display evidence derived from saved measurements, never from scores."""
import math
from statistics import mean, median

from app.schemas.reference import Measurements
from app.schemas.signal_prosody import DisplayFrame


def display_frames(measurements: Measurements, origin: float = 0) -> list[DisplayFrame]:
    if any(issue in measurements.quality_issues for issue in ("clipping", "low_energy", "insufficient_speech")):
        return []
    frames = measurements.frames
    if len(frames) < 5 or not 0 <= round(frames[0].time_sec - origin, 6) <= .011:
        return []
    if any(not math.isfinite(f.energy_dbfs) or not math.isfinite(f.time_sec) for f in frames) \
            or any(abs(b.time_sec - a.time_sec - .01) > 1e-5 for a, b in zip(frames, frames[1:])):
        return []
    voiced = [f.f0_hz if f.f0_hz and math.isfinite(f.f0_hz) and any(
        s.start_sec <= f.time_sec < s.end_sec for s in measurements.speech) else None for f in frames]
    pitches = [p for p in voiced if p is not None]
    baseline = median(pitches) if len(pitches) >= 5 else None
    result = []
    for i in range(0, len(frames), 2):
        window = voiced[i:i + 2]
        pitch = median(12 * math.log2(p / baseline) for p in window) \
            if baseline and all(p is not None for p in window) else None
        result.append(DisplayFrame(time_sec=round(frames[i].time_sec - origin, 6),
            pitch_st=pitch, energy_dbfs=mean(f.energy_dbfs for f in frames[i:i + 2])))
    return result
