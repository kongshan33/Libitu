"""A scene-specific suggestion; it never replaces the learner's saved targets."""
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator

from app.schemas.speaking_plan import LogicTemplateId, ScenarioType


class SceneLogicRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    scenario_type: ScenarioType
    brief: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=500)]
    corpus_item_ids: list[UUID] = Field(default_factory=list, max_length=5)

    @field_validator("corpus_item_ids")
    @classmethod
    def unique_targets(cls, value: list[UUID]) -> list[UUID]:
        if len(set(value)) != len(value):
            raise ValueError("Select each target once.")
        return value


class SceneLogicResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    logic_template_id: LogicTemplateId
    reason: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=400)]
