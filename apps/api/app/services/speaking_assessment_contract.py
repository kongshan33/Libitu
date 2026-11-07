"""Provider-only assessment shape, exact reference IDs and bounded field repairs.

The public report and pure legacy compiler keep their existing schema. All helpers
operate on the immutable source supplied to this assessment, never database state.
"""
from copy import deepcopy
import json

from app.services.speaking_evidence import target_candidates, evidence_catalog, normalize_target_quote

PROMPT = """
OUTPUT CONTRACT:
Use the supplied output_schema: dimensions and their criteria are OBJECTS keyed by
all required IDs, not arrays. Include every dimension and every criterion exactly
once. Emit each dimension's criteria first and its summary last, exactly once;
never repeat a JSON key. item_results is an OBJECT keyed by the supplied item_key
(t0, t1, ...), or null when there are no selected language targets.
reviewed_message_ids must contain every reliable user message ID exactly once.
Evidence references may be a supplied evidence_id string. Prefer these exact IDs
to copying quotes/UUIDs/offsets. Never change the wording or source behind an ID.
For selected language, review EVERY occurrence_candidate under its own item_key:
return {"candidate_id":"c0","appropriateness":"appropriate|inappropriate|uncertain",
"reason":"contextual reason"} in uses. Do not reclassify server match types.
A phrase mentioned on a card or denied as used must still get a candidate verdict
(inappropriate), not an empty uses array. Ordinary negation is not by itself wrong.
Only ADDITIONAL occurrences use the full reference/match_type form.
If a criterion truly cannot be assessed, include it with rating:null, a specific
reason, and evidence:[]. Never invent evidence or award a default rating to fill
fields. Across each scored dimension cite two user messages when available.
Keep criterion reasons within 25 words, dimension summaries within 40 words,
and each item/use reason within 20 words. Optional suggestions and refactors must
not displace required assessment fields. Never add criteria_order or field_order.
"""


def fixed_object(properties):
    return {"type": "object", "properties": properties, "required": list(properties), "additionalProperties": False}


def strict_schema(schema):
    """Inline local refs and project to DeepSeek's supported strict subset.

    Local Pydantic and coverage checks retain string lengths and array bounds.
    """
    definitions = schema.get("$defs", {})
    def visit(node):
        if "$ref" in node:
            name = node["$ref"].removeprefix("#/$defs/")
            if name not in definitions:
                raise ValueError("unknown_schema_reference")
            return visit(definitions[name])
        result = {key: deepcopy(value) for key, value in node.items()
                  if key in {"type", "enum", "minimum", "maximum", "pattern", "description"}}
        if "anyOf" in node:
            result["anyOf"] = [visit(child) for child in node["anyOf"]]
        if "const" in node:
            result["enum"] = [node["const"]]
        if node.get("type") == "object":
            result.update(fixed_object({key: visit(child) for key, child in node.get("properties", {}).items()}))
        if "items" in node:
            result["items"] = visit(node["items"])
        return result
    return visit(schema)


def repair_schema(problems, schema):
    def at(path):
        node = schema
        for key in path:
            while "$ref" in node:
                node = schema["$defs"][node["$ref"].removeprefix("#/$defs/")]
            node = node["items"] if isinstance(key, int) else node["properties"][key]
        return deepcopy(node)
    result = fixed_object({"repairs": fixed_object({row["id"]: at(row["path"]) for row in problems})})
    result["$defs"] = deepcopy(schema.get("$defs", {}))
    return result


def prepare(context, session, reliable, criteria):
    context = deepcopy(context)
    candidates = target_candidates(session.items, reliable)
    catalog = evidence_catalog(reliable, candidates)
    item_keys = {str(item.id): f"t{i}" for i, item in enumerate(session.items)}
    for item in context["selected_language"]:
        item["item_key"] = item_keys[item["session_item_id"]]
    for candidate in candidates:
        candidate["item_key"] = item_keys[candidate["session_item_id"]]
    context["occurrence_candidates"] = candidates
    context["evidence_catalog"] = catalog
    schema = context["output_schema"]
    original_reference = deepcopy(schema["$defs"]["_Reference"])
    schema["$defs"]["_Reference"] = {"anyOf": [
        {"type": "string", "enum": [r["evidence_id"] for r in catalog]}, original_reference]}
    reference = {"$ref": "#/$defs/_Reference"}
    criterion = deepcopy(schema["$defs"]["_Criterion"])
    criterion["properties"].pop("id")
    criterion["required"].remove("id")
    criterion["properties"]["evidence"]["items"] = reference
    schema["properties"]["dimensions"] = fixed_object({dimension: fixed_object({
        "criteria": fixed_object({key: criterion for key, _, _ in rows}),
        "summary": {"type": "string", "minLength": 1, "maxLength": 500},
    }) for dimension, rows in criteria.items()})
    use = deepcopy(schema["$defs"]["_Use"])
    use["properties"]["reference"] = reference
    review = fixed_object({"candidate_id": {"type": "string"},
        "appropriateness": {"type": "string", "enum": ["appropriate", "inappropriate", "uncertain"]},
        "reason": {"type": "string", "minLength": 1, "maxLength": 300}})
    schema["properties"]["item_results"] = fixed_object({key: fixed_object({
        "uses": {"type": "array", "maxItems": 40, "items": {"anyOf": [review, use]}},
        "reason": {"type": "string", "minLength": 1, "maxLength": 300},
    }) for key in item_keys.values()})
    if not item_keys:
        # DeepSeek rejects a strict object with no properties. Absence of targets
        # is known from the source, so use null and map it to the public empty list.
        schema["properties"]["item_results"] = {"type": "null"}
    return context


def decode(document, context, audit=None):
    """Map only known request-scoped references; normal validation still follows."""
    value = deepcopy(document)
    if not isinstance(value, dict):
        return value
    catalog = {row["evidence_id"]: {k: v for k, v in row.items() if k != "evidence_id"}
               for row in context["evidence_catalog"]}
    candidates = {row["candidate_id"]: row for row in context["occurrence_candidates"]}
    keys = {row["item_key"]: row["session_item_id"] for row in context["selected_language"]}
    if not keys and value.get("item_results", "missing") is None:
        value["item_results"] = []
    def reference(ref):
        return deepcopy(catalog.get(ref, {"invalid_evidence_id": ref})) if isinstance(ref, str) else ref
    dimensions = value.get("dimensions")
    if isinstance(dimensions, dict):
        value["dimensions"] = [{**row, "id": key} if isinstance(row, dict) else row for key, row in dimensions.items()]
    for dimension in value.get("dimensions", []) if isinstance(value.get("dimensions"), list) else []:
        if not isinstance(dimension, dict):
            continue
        if isinstance(dimension.get("criteria"), dict):
            order = dimension.get("criteria_order")
            if order is None or order == [] or (isinstance(order, list) and all(isinstance(key, str) for key in order) and len(order) == len(dimension["criteria"])
                               and set(order) == set(dimension["criteria"])):
                if "criteria_order" in dimension and audit is not None:
                    audit["ignored_redundant_criteria_order"] = True
                dimension.pop("criteria_order", None)
            dimension["criteria"] = [{**row, "id": key} if isinstance(row, dict) else row
                                      for key, row in dimension["criteria"].items()]
        for row in dimension.get("criteria", []) if isinstance(dimension.get("criteria"), list) else []:
            if isinstance(row, dict) and isinstance(row.get("evidence"), list):
                row["evidence"] = [reference(ref) for ref in row["evidence"]]
    if isinstance(value.get("item_results"), dict):
        value["item_results"] = [{**row, "session_item_id": keys.get(key, "invalid-item-key")}
                                 if isinstance(row, dict) else row for key, row in value["item_results"].items()]
    for item in value.get("item_results", []) if isinstance(value.get("item_results"), list) else []:
        if not isinstance(item, dict) or not isinstance(item.get("uses"), list):
            continue
        uses = []
        for use in item["uses"]:
            if isinstance(use, dict) and "candidate_id" in use:
                candidate = candidates.get(use["candidate_id"])
                if candidate and candidate["session_item_id"] == item.get("session_item_id") and set(use) == {"candidate_id", "appropriateness", "reason"}:
                    use = {"reference": {key: candidate[key] for key in ("message_id", "transcript_revision", "quote", "start", "end")},
                           "match_type": candidate["match_type"], "appropriateness": use["appropriateness"], "reason": use["reason"]}
            elif isinstance(use, dict) and "reference" in use:
                use["reference"] = reference(use["reference"])
            uses.append(use)
        item["uses"] = uses
    for field in ("refactors", "missed_opportunities"):
        for row in value.get(field, []) if isinstance(value.get(field), list) else []:
            if isinstance(row, dict) and "original" in row:
                row["original"] = reference(row["original"])
    for row in value.get("logic_stages", []) if isinstance(value.get("logic_stages"), list) else []:
        if isinstance(row, dict) and isinstance(row.get("evidence"), list):
            row["evidence"] = [reference(ref) for ref in row["evidence"]]
    return value


def issues(source, model):
    # Local import keeps schema definitions in the owning assessment service.
    from app.services import speaking_assessment as a
    session, _, reliable = a._source(source)
    expected_messages = {row["id"] for row in reliable}
    document = model.model_dump()
    problems = []
    def add(path, code, preserve_rating=False):
        if not any(row["path"] == path for row in problems):
            problems.append({"id": f"r{len(problems)}", "path": path, "code": code,
                             "preserve_rating": preserve_rating})
    if set(model.reviewed_message_ids) != expected_messages or len(model.reviewed_message_ids) != len(expected_messages):
        add(["reviewed_message_ids"], "review_every_reliable_turn")
    dimensions = {row.id: i for i, row in enumerate(model.dimensions)}
    if len(dimensions) != len(model.dimensions):
        add(["dimensions"], "duplicate_dimensions")
    else:
        for name, required in a.CRITERIA.items():
            if name not in dimensions:
                add(["dimensions"], "missing_dimension")
                continue
            index = dimensions[name]
            dimension = model.dimensions[index]
            by_id = {row.id: i for i, row in enumerate(dimension.criteria)}
            if len(by_id) != len(dimension.criteria) or set(by_id) != {key for key, _, _ in required}:
                add(["dimensions", index, "criteria"], "missing_or_duplicate_criteria")
                continue
            covered, valid = set(), True
            for j, row in enumerate(dimension.criteria):
                if row.rating is None:
                    valid = False  # Legitimate abstention never triggers a retry.
                    continue
                refs = a._references(row.evidence, reliable)
                if not refs or len(refs) != len(row.evidence):
                    add(["dimensions", index, "criteria", j], "invalid_scoring_reference")
                    valid = False
                covered.update(ref.message_id for ref in refs)
            if valid and len(covered) < min(2, len(reliable)):
                add(["dimensions", index, "criteria", 0], "dimension_needs_two_turns", True)
    by_item = {row.session_item_id: i for i, row in enumerate(model.item_results)}
    if len(by_item) != len(model.item_results) or set(by_item) != {str(item.id) for item in session.items}:
        add(["item_results"], "missing_unknown_or_duplicate_items")
    else:
        candidates = target_candidates(session.items, reliable)
        by_message = {row["id"]: row for row in reliable}
        for item in session.items:
            index = by_item[str(item.id)]
            accepted = []
            for use in model.item_results[index].uses:
                ref = a.validate_reference(use.reference, reliable)
                if not ref or not normalize_target_quote(item.text, item.kind, by_message[ref.message_id]["text"],
                                                        ref.quote, ref.start, ref.end, use.match_type):
                    add(["item_results", index], "invalid_target_reference")
                else:
                    accepted.append(ref)
            for candidate in candidates:
                if candidate["session_item_id"] != str(item.id):
                    continue
                if not any(ref.message_id == candidate["message_id"] and ref.start <= candidate["start"]
                           and ref.end >= candidate["end"] for ref in accepted):
                    add(["item_results", index], "unreviewed_occurrence")
    # A parent replacement subsumes its children; never apply overlapping patches.
    return [row for row in problems if not any(other is not row and len(other["path"]) < len(row["path"])
            and row["path"][:len(other["path"])] == other["path"] for other in problems)]


def apply_repairs(document, problems, patch):
    """Reject unsolicited paths, preserve valid siblings and usable ratings."""
    if not isinstance(patch, dict) or set(patch) != {"repairs"} or not isinstance(patch["repairs"], dict):
        raise ValueError("invalid_assessment_repair")
    expected = {row["id"] for row in problems}
    if set(patch["repairs"]) != expected:
        raise ValueError("invalid_assessment_repair_ids")
    result = deepcopy(document)
    for problem in problems:
        path, replacement = problem["path"], patch["repairs"][problem["id"]]
        parent = result
        for key in path[:-1]:
            parent = parent[key]
        old = parent[path[-1]]
        if problem.get("preserve_rating") and (not isinstance(replacement, dict) or replacement.get("rating") != old["rating"]):
            raise ValueError("repair_changed_valid_rating")
        # Whole-list repairs must retain every previously valid uniquely named row.
        if isinstance(old, list) and isinstance(replacement, list) and problem["code"] in {"missing_dimension", "missing_or_duplicate_criteria", "missing_unknown_or_duplicate_items"}:
            field = "session_item_id" if path[0] == "item_results" else "id"
            ids = [row.get(field) for row in old if isinstance(row, dict)]
            for row in old:
                if isinstance(row, dict) and ids.count(row.get(field)) == 1:
                    matches = [new for new in replacement if isinstance(new, dict) and new.get(field) == row.get(field)]
                    if len(matches) != 1 or matches[0] != row:
                        raise ValueError("repair_changed_existing_row")
        parent[path[-1]] = replacement
    return result


def load_json(raw, audit=None):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError("duplicate_assessment_key")
            result[key] = value
        return result
    # Observed provider defect: one extra closing brace AFTER a complete JSON
    # object. Never complete missing syntax, strip prose, or merge two objects.
    text = raw.strip()
    value, end = json.JSONDecoder(object_pairs_hook=unique).raw_decode(text)
    tail = text[end:].strip()
    if tail:
        if tail != "}" or not isinstance(value, dict):
            raise ValueError("assessment_trailing_content")
        if audit is not None:
            audit["removed_single_terminal_brace"] = True
    return value
