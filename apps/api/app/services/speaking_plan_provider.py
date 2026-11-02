"""Keep database identities out of the planner's copying task.

References belong to one request only. Restore IDs by exact reference, never by
array position or fuzzy UUID matching; normal plan validation still runs after.
"""

from copy import deepcopy
import json
import re

from app.services.speaking_teaching import request_analysis_json


async def request_plan_json(settings, prompt: str, context: dict, **kwargs):
    wire = deepcopy(context)
    identities = {}
    for index, target in enumerate(wire["targets"]):
        reference = f"t{index}"
        identities[reference] = target["corpus_item_id"]
        target["corpus_item_id"] = reference
        if target.get("kind") == "structure":
            target["model_line_anchors"] = [
                part.strip().rstrip(".!?。！？").strip()
                for part in re.split(r"\[[^\[\]\n]{1,120}\]", target["text"])
                if part.strip().rstrip(".!?。！？").strip()
            ]
    wire["output_schema"]["$defs"]["SpeakingPlanTarget"]["properties"]["corpus_item_id"] = {
        "type": "string", "enum": list(identities),
        "description": "Copy the supplied short target reference exactly.",
    }
    raw, trace = await request_analysis_json(settings, prompt, wire, **kwargs)
    # Reject malformed JSON and duplicate keys through the existing failure
    # path, rather than silently collapsing duplicate identity/patch fields.
    def unique_keys(pairs):
        value = {}
        for key, item in pairs:
            if key in value:
                raise ValueError("Duplicate output key")
            value[key] = item
        return value

    try:
        document = json.loads(raw, object_pairs_hook=unique_keys)
    except (ValueError, TypeError, RecursionError):
        return "null", trace

    def restore(targets):
        if not isinstance(targets, list):
            return
        for target in targets:
            if not isinstance(target, dict):
                continue
            reference = target.get("corpus_item_id")
            if isinstance(reference, str) and reference in identities:
                target["corpus_item_id"] = identities[reference]
            elif "corpus_item_id" in target:
                # Even an actual UUID is not a valid wire reference. Do not
                # accidentally accept a hallucinated/quoted database identity.
                target["corpus_item_id"] = "invalid-target-reference"

    if isinstance(document, dict):
        if "repair_tasks" in context:
            repairs = document.get("repairs")
            if isinstance(repairs, dict):
                for task in context["repair_tasks"]:
                    if task["field"] == "targets":
                        restore(repairs.get(task["id"]))
        else:
            candidates = document.get("candidates")
            if isinstance(candidates, list):
                for candidate in candidates:
                    if isinstance(candidate, dict):
                        restore(candidate.get("targets"))
    return json.dumps(document, ensure_ascii=False), trace
