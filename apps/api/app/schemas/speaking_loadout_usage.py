"""Read-only Stage 3 history, with unknown distinct from confirmed zero use."""
from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


class LoadoutUsageRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    corpus_item_ids: list[UUID] = Field(max_length=500)

    @model_validator(mode="after")
    def unique_items(self):
        if len(set(self.corpus_item_ids)) != len(self.corpus_item_ids):
            raise ValueError("Select each corpus item only once.")
        return self


class ReviewRule(BaseModel):
    id: Literal["recorded-use-7d-v1"] = "recorded-use-7d-v1"
    interval_days: Literal[7] = 7


class ItemUsage(BaseModel):
    state: Literal["used", "never", "unknown"]
    all_use_count: int | None = Field(default=None, ge=0)
    last_used_at: datetime | None = None
    due_at: datetime | None = None
    due: bool | None = None
    unknown_reasons: list[Literal[
        "pending_assessment", "unsupported_evidence", "invalid_evidence", "history_truncated",
    ]] = Field(default_factory=list)


class LoadoutPracticeHistory(BaseModel):
    qualifying_missions: int = Field(ge=0)
    practice_days: int = Field(ge=0)
    scene_roots: int = Field(ge=0)
    eligible: bool
    history_truncated: bool


class LoadoutUsageItem(BaseModel):
    corpus_item_id: UUID
    usage: ItemUsage
    practice: LoadoutPracticeHistory


class LoadoutUsageSummary(BaseModel):
    as_of: datetime
    review_rule: ReviewRule = Field(default_factory=ReviewRule)
    items: list[LoadoutUsageItem]
