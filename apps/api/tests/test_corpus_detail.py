import json

import httpx
import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import app
from app.integrations import ark_corpus_detail as detail, ark_selection
from app.schemas.corpus import CorpusSelectionAnalysis
from app.schemas.corpus import CorpusSelectionAnalysisRequest
from app.services.corpus_selection_service import _normalize_evidenced_analysis
from test_smoke import selection_analysis_result

CONTEXT = {"selected_text": "to be fair", "current_sentence": "To be fair, the plan worked."}


def provider(monkeypatch, response):
    settings = Settings.model_construct(ark_api_key="fixture", ark_model="fixture-model", ark_max_output_tokens=8000)
    monkeypatch.setattr(detail, "get_settings", lambda: settings)
    requests = []
    def handle(request):
        requests.append(json.loads(request.content))
        return response
    client = httpx.Client(base_url="https://fixture.invalid", transport=httpx.MockTransport(handle))
    monkeypatch.setattr(detail, "_selection_client", lambda: client)
    return requests, client


def test_explain_drops_unrequested_syntax_but_legacy_records_remain_readable():
    old = selection_analysis_result("to be fair").model_dump(by_alias=True)
    assert CorpusSelectionAnalysis.model_validate(old).syntax_state == "ready"
    result = ark_selection._parse_selection_response({"choices": [{"finish_reason": "stop", "message": {"content": json.dumps(old)}}]})
    assert result.schema_version == 3 and result.syntax_state == "pending"
    assert result.syntax_analysis.main_clause == ""
    assert "本次只生成 Explain" in ark_selection.SYSTEM_PROMPT


@pytest.mark.parametrize("kind,selection_type,full", [("chunk", "phrase", False), ("structure", "phrase", True), ("chunk", "sentence", True)])
def test_syntax_mode_is_enforced(monkeypatch, kind, selection_type, full):
    syntax = {"sentence_type": "名词短语（unrequested extra classification）", "main_clause": "discourse marker", "logic_relations": ["concession"],
        "information_hierarchy": ["core"], "grammar_points": ["role already in main_clause"], "usage_scenarios": ["duplicate"], "evidence": ["invented"],
        "translations": [{"label": "直译", "text": "公平地说"}]}
    requests, client = provider(monkeypatch, httpx.Response(200, json={"choices": [{"finish_reason": "stop", "message": {"content": json.dumps(syntax)}}]}))
    try:
        response = TestClient(app).post("/api/corpus/analyze-syntax", json={**CONTEXT, "selection_type": selection_type, "kind": kind})
        assert response.status_code == 200
        result = response.json()
        assert result["sentence_type"] == (syntax["sentence_type"] if full else "名词短语")
        assert bool(result["information_hierarchy"]) == full
        assert result["translations"][0]["text"] == "公平地说"
        assert bool(result["grammar_points"]) == full
        assert result["usage_scenarios"] == []
        assert result["evidence"] == [CONTEXT["current_sentence"]]
        assert requests[0]["stream"] is False
    finally:
        client.close()


def test_syntax_error_does_not_return_placeholder_success(monkeypatch):
    _, client = provider(monkeypatch, httpx.Response(429))
    try:
        assert TestClient(app).post("/api/corpus/analyze-syntax", json={**CONTEXT, "selection_type": "phrase", "kind": "chunk"}).status_code == 503
    finally:
        client.close()


@pytest.mark.parametrize("finish", ["stop", "length", None])
def test_stream_only_completes_on_explicit_stop(monkeypatch, finish):
    packets = [{"choices": [{"delta": {"content": "**Try** a simpler expression."}}]}]
    if finish:
        packets.append({"choices": [{"delta": {}, "finish_reason": finish}]})
    body = "".join(f"data: {json.dumps(packet)}\n\n" for packet in packets) + "data: [DONE]\n\n"
    requests, client = provider(monkeypatch, httpx.Response(200, text=body))
    try:
        response = TestClient(app).post("/api/corpus/ask", json={**CONTEXT, "question": "Make it casual"})
        assert "event: delta" in response.text
        assert ("event: done" in response.text) == (finish == "stop")
        assert ("event: error" in response.text) == (finish != "stop")
        assert requests[0]["stream"] is True
        assert "response_format" not in requests[0]
    finally:
        client.close()


def test_followup_input_is_bounded():
    assert TestClient(app).post("/api/corpus/ask", json={**CONTEXT, "question": "x" * 501}).status_code == 422
    assert TestClient(app).post("/api/corpus/ask", json={**CONTEXT, "question": "why", "history": [{"question": "why", "answer": "answer"}] * 7}).status_code == 422


def test_explain_owns_placeholder_and_omits_retired_duplicate():
    output = selection_analysis_result("to be fair").model_dump(by_alias=True)
    # Neither field is requested from the paid provider any more.
    output.pop("note_placeholder")
    output["explanation"].pop("pragmatic_function")
    parse = lambda value: ark_selection._parse_selection_response({"choices": [
        {"finish_reason": "stop", "message": {"content": json.dumps(value)}}]})
    result = parse(output)
    assert result.note_placeholder == "可选：写下你的理解、联想或使用场景"
    assert result.explanation.pragmatic_function == ""
    # Older provider responses cannot fill an input placeholder with an essay.
    output["note_placeholder"] = "A long duplicated teaching paragraph"
    output["explanation"]["pragmatic_function"] = "Repeated teaching intent"
    output["pitfalls"] = ["A speculative ban on a legitimate singular form"]
    assert parse(output).note_placeholder == result.note_placeholder
    assert parse(output).explanation.pragmatic_function == ""
    assert parse(output).pitfalls == []


def test_boundary_copy_follows_validated_expansion():
    payload = CorpusSelectionAnalysisRequest(**CONTEXT)
    result = selection_analysis_result(CONTEXT['selected_text']).model_copy(update={
        'recommended_text': 'invented expansion', 'completeness': 'needs_expansion',
        'recommendation_reason': 'Incorrect grammar analysis unrelated to selection boundaries',
    })
    normalized = _normalize_evidenced_analysis(payload, result)
    assert normalized.recommended_text == payload.selected_text
    assert normalized.completeness == 'complete'
    assert normalized.recommendation_reason == '所选内容边界完整，无需补全。'
    valid = result.model_copy(update={
        'recommended_text': payload.current_sentence,
        'recommendation_reason': '需要上下文中的完整表达。',
    })
    assert _normalize_evidenced_analysis(payload, valid).recommendation_reason == valid.recommendation_reason


@pytest.mark.parametrize('provider_name', ['ark', 'deepseek'])
@pytest.mark.parametrize('task', ['explain', 'syntax', 'followup'])
def test_corpus_provider_routes_endpoint_model_and_credential(monkeypatch, provider_name, task):
    settings = Settings.model_construct(
        corpus_analysis_provider=provider_name, ark_api_key='ark-fixture',
        deepseek_api_key='deepseek-fixture', ark_model='doubao-fixture',
    )
    requests = []
    def handle(request):
        requests.append(request)
        expected_host = 'api.deepseek.com' if provider_name == 'deepseek' else 'ark.cn-beijing.volces.com'
        assert request.url.host == expected_host
        assert request.headers['Authorization'] == f'Bearer {provider_name}-fixture'
        data = json.loads(request.content)
        assert data['model'] == ('deepseek-flash' if provider_name == 'deepseek' else 'doubao-fixture')
        assert data['thinking'] == {'type': 'disabled'}
        if task == 'followup':
            assert data['stream'] is True and 'response_format' not in data
            packet = {'choices': [{'delta': {'content': 'A concise answer.'}, 'finish_reason': 'stop'}]}
            return httpx.Response(200, text=f'data: {json.dumps(packet)}\n\ndata: [DONE]\n\n')
        assert data['response_format'] == {'type': 'json_object'}
        result = selection_analysis_result('to be fair').model_dump(by_alias=True) if task == 'explain' else {
            'sentence_type': '话语标记', 'main_clause': '表让步',
        }
        return httpx.Response(200, json={'choices': [{'finish_reason':'stop', 'message':{'content':json.dumps(result)}}]})
    original_client = httpx.Client
    monkeypatch.setattr(httpx, 'Client', lambda **kwargs: original_client(**kwargs, transport=httpx.MockTransport(handle)))
    for module in (ark_selection, detail):
        monkeypatch.setattr(module, 'get_settings', lambda: settings)
    ark_selection._selection_client.cache_clear()
    try:
        if task == 'explain':
            assert ark_selection.generate_selection_analysis(CorpusSelectionAnalysisRequest(**CONTEXT)).analysis_source == 'ai'
        elif task == 'syntax':
            assert detail.generate_corpus_syntax(detail.CorpusSyntaxRequest(**CONTEXT, selection_type='phrase', kind='chunk')).main_clause
        else:
            events = ''.join(detail.stream_corpus_followup(detail.CorpusFollowupRequest(**CONTEXT, question='Explain')))
            assert 'event: done' in events and 'event: error' not in events
        assert len(requests) == 1
        assert settings.ark_model == 'doubao-fixture'
    finally:
        ark_selection._selection_client().close()
        ark_selection._selection_client.cache_clear()


def test_missing_deepseek_key_does_not_fall_back_to_ark(monkeypatch):
    settings = Settings.model_construct(corpus_analysis_provider='deepseek', deepseek_api_key=None, ark_api_key='ark-fixture')
    for module in (ark_selection, detail):
        monkeypatch.setattr(module, 'get_settings', lambda: settings)
    with pytest.raises(detail.AnalysisProviderError, match='not configured'):
        ark_selection.generate_selection_analysis(CorpusSelectionAnalysisRequest(**CONTEXT))
    with pytest.raises(detail.AnalysisProviderError, match='not configured'):
        detail._request('system', detail.CorpusFollowupRequest(**CONTEXT, question='Explain'), stream=True)


@pytest.mark.parametrize("selected,learning", [
    ("drifted away from", "drift away from"),
    ("pockets of greatness", "pocket of greatness"),
    ("made ends meet", "make ends meet"),
])
def test_learning_form_preserves_original_evidence_and_drives_audio(selected, learning):
    payload = CorpusSelectionAnalysisRequest(selected_text=selected, current_sentence=f"They {selected}.")
    output = selection_analysis_result(selected).model_dump(by_alias=True)
    output.update(learning_text=learning, ask_suggestions=["换个领域怎么用？", "用它写一段具体对话", "能比较一下近义表达吗？"])
    output["explanation"]["meaning_summary"] = "一句简短释义"
    output["explanation"]["similar_expressions"] = [f"{selected} — 原样重复", "unsupported alternative — 更显正式", "opposite — 与原意相反", "another expression — 不同侧重"]
    parsed = ark_selection._parse_selection_response({"choices": [{"finish_reason": "stop", "message": {"content": json.dumps(output)}}]})
    result = _normalize_evidenced_analysis(payload, parsed)
    assert result.selected_text == result.recommended_text == selected
    assert result.learning_text == result.explanation.pronunciation.audio_text == learning
    assert result.syntax_analysis.evidence == [payload.current_sentence]
    assert result.explanation.meaning_summary == "一句简短释义"
    assert len(result.ask_suggestions) == 3
    assert result.explanation.similar_expressions == ["another expression — 不同侧重"]


def test_sentence_keeps_inflection_even_if_provider_sends_lemma():
    selected = "She made ends meet."
    payload = CorpusSelectionAnalysisRequest(selected_text=selected, current_sentence=selected)
    analysis = selection_analysis_result(selected).model_copy(update={"selection_type": "sentence", "learning_text": "make ends meet"})
    result = _normalize_evidenced_analysis(payload, analysis)
    assert result.learning_text == result.explanation.pronunciation.audio_text == selected


def test_redundant_closing_brace_is_the_only_json_repair():
    assert ark_selection._selection_json('{"value": "}"}}') == {"value": "}"}
    for content in ['{"value": 1}{}', '{"value": 1} explanation', '{"value": 1', '{"value": 1}}}']:
        with pytest.raises(json.JSONDecodeError):
            ark_selection._selection_json(content)


@pytest.mark.parametrize("selected,expected", [("She struggles to explain it.", 1), ("She cannot explain it.", 2)])
def test_syntax_omits_paraphrase_that_turns_difficulty_into_inability(monkeypatch, selected, expected):
    output = {"sentence_type": "简单句", "main_clause": selected, "translations": [
        {"label": "直译", "text": "她解释起来有困难。"}, {"label": "意译", "text": "她说不清。"}]}
    _, client = provider(monkeypatch, httpx.Response(200, json={"choices": [{"finish_reason": "stop", "message": {"content": json.dumps(output)}}]}))
    try:
        result = detail.generate_corpus_syntax(detail.CorpusSyntaxRequest(selected_text=selected, current_sentence=selected, selection_type="sentence", kind="structure"))
        assert len(result.translations) == expected
    finally:
        client.close()
