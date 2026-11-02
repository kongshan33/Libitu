"""Server-owned scenario planning and the immutable plan carried by a Mission."""

from datetime import datetime
from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator, model_serializer, model_validator


ShortText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=500)]
ScenarioType = Literal["workplace", "everyday", "travel"]
ScenarioRegister = Literal["casual", "neutral", "professional", "formal"]
PracticeVariation = Literal["details", "role_swap"]
LogicTemplateId = Literal[
    "persuasive_pitch", "technical_troubleshoot", "stakeholder_alignment",
    "status_update", "disagreement", "onboarding", "telling_story", "making_plans", "catching_up",
]


class LogicTemplate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: LogicTemplateId
    title: ShortText
    description: ShortText
    steps: list[ShortText] = Field(min_length=1, max_length=12)


class PracticePlanCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    variation: PracticeVariation


class PracticeSource(BaseModel):
    model_config = ConfigDict(extra="forbid")

    parent_session_id: UUID
    root_session_id: UUID
    variation: PracticeVariation
    parent_snapshot_hash: str = Field(pattern=r"^[a-f0-9]{64}$")


class ScenarioChange(BaseModel):
    model_config = ConfigDict(extra="forbid")

    field: Literal["setting", "goal", "user_role", "ai_role"]
    before: ShortText
    after: ShortText


class PlanTargetSelection(BaseModel):
    model_config = ConfigDict(extra="forbid")

    corpus_item_id: UUID
    role: Literal["primary", "opportunity"]
    stage_index: int | None = Field(default=None, ge=0, strict=True)


class SpeakingPlanCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    scenario_type: ScenarioType
    brief: Annotated[str, StringConstraints(strip_whitespace=True, max_length=500)] = ""
    # Existing callers compare scenes; one-button Start requests only one.
    candidate_count: Literal[1, 2] = 2
    logic_template_id: LogicTemplateId | None = None
    targets: list[PlanTargetSelection] = Field(min_length=1, max_length=5)

    @model_validator(mode="after")
    def validate_targets(self) -> "SpeakingPlanCreate":
        primary = sum(target.role == "primary" for target in self.targets)
        # New loadouts give every target equal priority. Retain the opportunity
        # role for saved plans and linked practice created before this change.
        if not 1 <= primary <= 5 or len(self.targets) - primary > 2:
            raise ValueError("Choose one to five targets; legacy opportunity selections are limited to two.")
        if len({target.corpus_item_id for target in self.targets}) != len(self.targets):
            raise ValueError("Select each corpus item only once.")
        if self.logic_template_id is not None and primary != len(self.targets):
            raise ValueError("Logic-constrained plans give every target equal priority.")
        if self.logic_template_id is None and any(target.stage_index is not None for target in self.targets):
            raise ValueError("Target stages require a logic template.")
        return self


class SpeakingPlanTarget(PlanTargetSelection):
    communicative_function: ShortText
    fit: Literal["high", "medium", "low", "unknown"]
    fit_reason: ShortText
    trigger_question: ShortText
    simpler_question: str | None = None

    @field_validator("simpler_question", mode="before")
    @classmethod
    def optional_simpler_question(cls, value):
        return value.strip() if isinstance(value, str) and 0 < len(value.strip()) <= 240 and len(value.split()) <= 30 else None

    @model_serializer(mode="wrap")
    def omit_absent_simpler_question(self, handler):
        result = handler(self)
        if self.simpler_question is None:
            result.pop("simpler_question", None)
        return result

    skip_when: ShortText
    # Old persisted plans remain readable; new generation validates a real frame.
    sentence_frame: ShortText | None = None
    model_line: ShortText | None = None
    # Derived from stored corpus metadata, never accepted as a model assertion.
    metadata_status: Literal["available", "partial", "unknown"] = "unknown"


class ScenarioProposal(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, serialize_by_alias=True)

    title: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]
    setting: ShortText
    goal: ShortText
    user_role: ShortText
    ai_role: ShortText
    usage_register: ScenarioRegister = Field(validation_alias="register", serialization_alias="register")
    targets: list[SpeakingPlanTarget] = Field(min_length=1, max_length=5)


class ScenarioProposals(BaseModel):
    model_config = ConfigDict(extra="forbid")

    candidates: list[ScenarioProposal] = Field(min_length=1, max_length=3)


class SpeakingScenarioCandidate(ScenarioProposal):
    id: UUID
    changes: list[ScenarioChange] = Field(default_factory=list, max_length=4)


class SpeakingPlan(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    version: Literal[1, 2] = 1
    logic_template: LogicTemplate | None = None
    scenario_type: ScenarioType
    brief: str
    created_at: datetime
    candidates: list[SpeakingScenarioCandidate] = Field(min_length=1, max_length=3)
    practice_source: PracticeSource | None = None

    @model_validator(mode="after")
    def validate_contract(self) -> "SpeakingPlan":
        _validate_versioned_targets(self.version, self.logic_template,
                                    [target for candidate in self.candidates for target in candidate.targets])
        return self


class SpeakingMissionTarget(SpeakingPlanTarget):
    session_item_id: UUID
    parent_session_item_id: UUID | None = None


class SpeakingMissionPlan(ScenarioProposal):
    plan_id: UUID
    candidate_id: UUID
    version: Literal[1, 2] = 1
    logic_template: LogicTemplate | None = None
    scenario_type: ScenarioType
    targets: list[SpeakingMissionTarget] = Field(min_length=1, max_length=5)
    changes: list[ScenarioChange] = Field(default_factory=list, max_length=4)

    @model_validator(mode="after")
    def validate_contract(self) -> "SpeakingMissionPlan":
        _validate_versioned_targets(self.version, self.logic_template, self.targets)
        return self


def _validate_versioned_targets(version: int, logic: LogicTemplate | None,
                                targets: list[SpeakingPlanTarget]) -> None:
    if version == 1:
        if logic is not None or any(target.stage_index is not None or target.model_line is not None
                                    for target in targets):
            raise ValueError("Logic and modeled targets require plan version 2.")
        return
    if logic is None:
        raise ValueError("Version 2 requires a frozen logic template.")
    if any(target.role != "primary" or not target.model_line or
           target.stage_index is not None and target.stage_index >= len(logic.steps)
           for target in targets):
        raise ValueError("Version 2 requires equal targets, valid stages and a model line for every target.")
