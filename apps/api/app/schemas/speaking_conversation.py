"""Versioned Conversation presentation contract, separate from frozen Mission plans."""
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, model_validator


class QuoteRef(BaseModel):
    message_id: str
    revision: int = Field(ge=1)
    start: int = Field(ge=0)
    end: int = Field(gt=0)
    quote: str


Budget = Literal['available', 'reserved', 'completed', 'suppressed', 'failed']
Level = Literal['direction', 'usage', 'example']


class ConversationQuestion(BaseModel):
    id: str
    context_version: int = Field(ge=1)
    origin: QuoteRef
    current: QuoteRef
    stage_index: int | None = None
    target_item_id: str | None = None
    status: Literal['presenting', 'awaiting_reply', 'responding', 'answered', 'superseded', 'interrupted', 'closed']
    auto_rephrase: Budget = 'available'
    auto_direction: Budget = 'available'
    automatic_help_closed: bool = False


class ConversationHelp(BaseModel):
    id: str
    version: int = Field(ge=1)
    question_id: str
    question_version: int = Field(ge=1)
    target_item_id: str | None = None
    source: Literal['automatic', 'requested']
    level: Level
    status: Literal['loading', 'ready', 'unavailable', 'retired']
    direction: str | None = Field(default=None, max_length=160)
    opening_words: str | None = Field(default=None, max_length=120)
    example: str | None = Field(default=None, max_length=400)
    error_code: Literal['unavailable', 'invalid_content'] | None = None

    @model_validator(mode='after')
    def content_matches_level(self):
        field = {'direction': 'direction', 'usage': 'opening_words', 'example': 'example'}[self.level]
        for name in ('direction', 'opening_words', 'example'):
            value = getattr(self, name)
            if self.status == 'ready' and name == field:
                if not value or not value.strip():
                    raise ValueError('missing_help_content')
            elif value is not None:
                raise ValueError('unexpected_help_content')
        return self


class RecastEdit(BaseModel):
    start: int = Field(ge=0)
    end: int = Field(ge=0)
    before: str
    after: str


class ChangedSpan(BaseModel):
    start: int = Field(ge=0)
    end: int = Field(gt=0)
    quote: str


class ConversationRecast(BaseModel):
    id: str
    version: int = Field(ge=1)
    source: QuoteRef
    replacement: str = Field(min_length=1, max_length=400)
    edits: list[RecastEdit] = Field(min_length=1, max_length=3)
    changed_spans: list[ChangedSpan]
    status: Literal["ready", "retired", "unavailable"]
    delivery: QuoteRef | None = None


class ConversationStageMarker(BaseModel):
    source: QuoteRef
    stage_index: int = Field(ge=0)
    label: str


class ConversationView(BaseModel):
    stage_markers: list[ConversationStageMarker] = Field(default_factory=list, max_length=200)
    recasts: list[ConversationRecast] = Field(default_factory=list)
    contract_version: Literal[1] = 1
    question: ConversationQuestion | None = None
    help: ConversationHelp | None = None


class HelpRequest(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)
    type: Literal['help.request']
    request_id: str = Field(min_length=1, max_length=64)
    question_id: str = Field(min_length=1, max_length=64)
    question_version: int = Field(ge=1)
    level: Level
    target_item_id: str | None = Field(default=None, max_length=64)
