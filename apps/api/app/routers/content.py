from typing import Annotated
from uuid import NAMESPACE_URL, uuid5

from fastapi import APIRouter, HTTPException, Path, Query, Response

from app.schemas.analysis import LearnerLevel
from app.schemas.caption_recovery import CaptionTimingRequest, CaptionTimingResponse
from app.schemas.content import ContentResolveRequest, ContentResolveResponse, ContentContext, PublicContent
from app.services.content_context import read_content_context, read_public_content
from app.services.caption_recovery import CaptionRecoveryError, recover_caption_timing
from app.services.blueprint_service import get_blueprint, personalize_blueprint
from app.services.caption_source import has_highlight_interval
from app.services.content_resolver import resolve_content

router = APIRouter()


@router.get("/{content_id}")
def read_context(
    content_id: Annotated[str, Path(min_length=1, max_length=250, pattern=r"^[A-Za-z0-9_-]+$")],
    response: Response,
) -> ContentContext:
    response.headers["Cache-Control"] = "no-store"
    return read_content_context(content_id)


@router.get("/{content_id}/identity")
def read_identity(
    content_id: Annotated[str, Path(min_length=1, max_length=250, pattern=r"^[A-Za-z0-9_-]+$")],
    response: Response,
) -> PublicContent:
    response.headers["Cache-Control"] = "no-store"
    return read_public_content(content_id)


@router.get("/youtube/{video_id}/timed-practice")
def find_timed_practice(
    video_id: Annotated[str, Path(pattern=r"^[A-Za-z0-9_-]{11}$")], response: Response,
) -> PublicContent | None:
    """A read-only shortcut while the extension is still acquiring captions."""
    response.headers["Cache-Control"] = "no-store"
    content_id = str(uuid5(NAMESPACE_URL, f"youtube:{video_id}"))
    content = read_public_content(content_id)
    blueprint = get_blueprint(content_id)
    if blueprint is None:
        return None
    view = personalize_blueprint(blueprint, None)
    if has_highlight_interval(word for line in view.transcript for word in line.word_timings or []):
        return content
    return None


@router.post("/resolve")
def resolve(payload: ContentResolveRequest) -> ContentResolveResponse:
    return resolve_content(payload)


@router.post("/{content_id}/caption-timing")
def restore_caption_timing(
    content_id: Annotated[str, Path(min_length=1, max_length=250, pattern=r"^[A-Za-z0-9_-]+$")],
    payload: CaptionTimingRequest,
    learner_level: Annotated[LearnerLevel | None, Query()] = None,
) -> CaptionTimingResponse:
    try:
        return recover_caption_timing(content_id, payload.caption_track, learner_level)
    except CaptionRecoveryError as error:
        raise HTTPException(status_code=error.status_code, detail={
            "code": error.code, "message": error.message,
        }) from error
