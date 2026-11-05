"""Read-only compatibility for results saved before 20 ms display frames."""
from copy import deepcopy

from pydantic import ValidationError

from app.schemas.reference import Measurements
from app.services.acoustics.display_frames import display_frames


def needs_frames(voice: dict | None) -> bool:
    signal = (voice or {}).get("rhythm_signal")
    return bool(signal and not signal.get("display_frames"))


def with_frames(voice: dict, raw: dict | None, origin: float = 0) -> dict:
    if not raw or not needs_frames(voice):
        return voice
    try:
        frames = display_frames(Measurements.model_validate(raw), origin)
    except (ValidationError, ValueError, TypeError):
        return voice
    if not frames:
        return voice
    result = deepcopy(voice)
    result["rhythm_signal"]["display_frames"] = [f.model_dump(mode="json") for f in frames]
    return result
