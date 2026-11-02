"""Public Stage 4 contract. Private provider prompts and tickets never enter snapshots."""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_serializer

from app.schemas.speaking_conversation import ConversationView
from app.schemas.speaking import SpeakingSession, SupportLevel


class RealtimeStart(BaseModel):
    model_config = ConfigDict(extra="forbid")
    client_connection_id: UUID
    takeover: bool = False
    conversation_contract_version: int | None = Field(default=None, strict=True)


class RealtimeTicket(BaseModel):
    runtime_id: UUID
    ticket: str
    expires_at: datetime
    websocket_path: str


class RuntimeView(BaseModel):
    @model_serializer(mode="wrap")
    def omit_legacy_version(self, handler):
        result = handler(self)
        if self.conversation_contract_version is None:
            result.pop("conversation_contract_version", None)
        return result

    conversation_contract_version: Literal[1] | None = None
    id: UUID
    generation: int
    state: Literal["connecting", "connected", "disconnected"]
    expires_at: datetime


class SpeakingMessage(BaseModel):
    id: str
    ordinal: int
    role: Literal["user", "assistant"]
    text: str
    input_source: Literal["voice", "text"]
    status: Literal["final", "interrupted", "unavailable"]
    revision: int = 1
    provider_item_id: str | None = None
    response_id: str | None = None
    client_turn_id: str | None = None
    created_at: str


class SpeakingEvidence(BaseModel):
    id: str
    session_item_id: str
    message_id: str
    transcript_revision: int
    start: int = Field(ge=0)
    end: int = Field(ge=0)
    quote: str
    match_type: Literal["exact", "variant", "structure"]
    appropriateness: Literal["appropriate", "uncertain", "inappropriate"]
    prompted: bool
    assistance: Literal["independent", "direction", "usage", "example", "overlap", "unknown"] | None = None
    reason: str


class LearningItem(BaseModel):
    session_item_id: str
    observed_uses: int = 0
    independent_uses: int = 0
    prompted_uses: int = 0
    last_message_id: str | None = None


class TeachingPolicyView(BaseModel):
    id: str
    source_message_id: str
    source_revision: int
    learning_version: int
    target_item_id: str | None
    action: Literal["continue_naturally", "implicit_elicitation", "explicit_hint", "model_then_transfer", "move_on"]
    status: Literal["pending", "applied", "expired"]
    response_id: str | None = None


class SpeakingHelpCard(BaseModel):
    id: UUID
    version: int = Field(ge=1)
    target_item_id: str | None = None
    level: Literal["direction", "usage", "example"]
    status: Literal["loading", "ready", "unavailable"]
    direction: str
    expression: str | None = None
    meaning: str | None = None
    pattern: str | None = None
    example: str | None = None
    substitution: str | None = None
    source: Literal["automatic", "requested"]
    source_message_id: str | None = None
    error: str | None = None


class SpeakingOpportunity(BaseModel):
    session_item_id: str
    role: Literal["primary", "opportunity"]
    status: Literal["planned", "offered", "used", "skipped"]
    skipped_reason: str | None = None
    skipped_at: str | None = None
    sent: bool = False
    bound: bool = False
    reflected: bool = False
    presented: bool = False
    last_response_id: str | None = None


class SupportView(BaseModel):
    level: SupportLevel
    version: int = Field(ge=0)


class DemonstrationView(BaseModel):
    target_item_id: str
    message_id: str
    revision: int = Field(ge=1)
    start: int = Field(ge=0)
    end: int = Field(gt=0)
    quote: str


class StageProgressItem(BaseModel):
    index: int = Field(ge=0)
    label: str
    status: Literal["pending", "current", "completed", "skipped"]


class TargetStageProgress(BaseModel):
    session_item_id: str
    stage_index: int | None = None
    modeling_status: Literal["pending", "modeled", "exposed", "uncertain", "not_needed"]
    practice_status: Literal["pending", "offered", "responded", "attempted", "independent", "skipped"]
    imitation_uses: int = Field(default=0, ge=0)


class StageProgressView(BaseModel):
    current_stage_index: int | None = None
    stages: list[StageProgressItem]
    targets: list[TargetStageProgress]


class SpeakingWorkspace(BaseModel):
    conversation: ConversationView | None = None
    session: SpeakingSession
    version: int
    runtime: RuntimeView | None = None
    messages: list[SpeakingMessage] = Field(default_factory=list)
    evidence: list[SpeakingEvidence] = Field(default_factory=list)
    learning: list[LearningItem] = Field(default_factory=list)
    policy: TeachingPolicyView | None = None
    analysis_status: Literal["idle", "pending", "ready", "unavailable"] = "idle"
    hint: str | None = None
    help: SpeakingHelpCard | None = None
    opportunities: list[SpeakingOpportunity] = Field(default_factory=list)
    support: SupportView | None = None
    demonstrations: list[DemonstrationView] = Field(default_factory=list)
    stage_progress: StageProgressView | None = None
