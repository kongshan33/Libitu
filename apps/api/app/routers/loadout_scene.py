"""Stage 3 custom scene interpretation, without starting a conversation."""
from fastapi import APIRouter

from app.auth import CurrentUserDep
from app.schemas.loadout_scene import SceneLogicRequest, SceneLogicResponse
from app.services.loadout_scene import suggest_scene_logic

router = APIRouter(prefix="/api/speaking", tags=["speaking"])


@router.post("/scene-logic")
async def scene_logic(payload: SceneLogicRequest, current_user: CurrentUserDep) -> SceneLogicResponse:
    return await suggest_scene_logic(current_user.id, payload)
