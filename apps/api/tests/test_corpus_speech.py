import base64
import io
import json
import wave
from contextlib import asynccontextmanager

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.integrations import corpus_speech as speech
from app.main import app


def mock_voice(monkeypatch, *, transcript='drifted away from', status='completed', pcm=b'\0\0' * 2400):
    settings = Settings.model_construct(openai_api_key='test-key')
    monkeypatch.setattr(speech, 'get_settings', lambda: settings)
    sent = []
    class Socket:
        async def send(self, raw): sent.append(json.loads(raw))
        async def __aiter__(self):
            yield json.dumps({'type':'session.updated'})
            yield json.dumps({'type':'response.output_audio.delta','delta':base64.b64encode(pcm).decode()})
            yield json.dumps({'type':'response.done','response':{'status':status,'output':[
                {'content':[{'type':'output_audio','transcript':transcript}]}]}})
    @asynccontextmanager
    async def connection(config):
        assert config.openai_realtime_model == 'gpt-realtime-2.1-mini'
        yield Socket()
    monkeypatch.setattr(speech, 'open_realtime', connection)
    return sent, settings


def test_speech_returns_wav_and_isolates_voice_configuration(monkeypatch):
    sent, settings = mock_voice(monkeypatch)
    response = TestClient(app).post('/api/corpus/speech',json={'text':' drifted away from '})
    assert response.status_code == 200 and response.headers['content-type'] == 'audio/wav'
    assert response.headers['cache-control'] == 'no-store'
    with wave.open(io.BytesIO(response.content)) as audio:
        assert (audio.getframerate(),audio.getnchannels(),audio.getsampwidth(),audio.getnframes()) == (24000,1,2,2400)
    assert sent[1]['response']['conversation'] == 'none'
    assert sent[1]['response']['input'][0]['content'][0]['text'] == 'drifted away from'
    assert settings.openai_realtime_model == 'gpt-realtime-2.1'


@pytest.mark.parametrize('options', [
    {'transcript':'Here is an explanation'}, {'status':'incomplete'}, {'pcm':b''}, {'pcm':b'\0'},
    {'pcm':b'\0' * (speech.MAX_PCM_BYTES + 2)},
])
def test_speech_rejects_wrong_text_incomplete_and_oversized_audio(monkeypatch,options):
    mock_voice(monkeypatch, **options)
    response = TestClient(app).post('/api/corpus/speech',json={'text':'drifted away from'})
    assert response.status_code == 503
    assert response.json()['detail'] == 'Voice is unavailable. Please retry.'


@pytest.mark.parametrize('text',['', '  ', 'x'*801])
def test_speech_bounds_input_before_calling_provider(text):
    assert TestClient(app).post('/api/corpus/speech',json={'text':text}).status_code == 422


def test_missing_key_has_retryable_public_error():
    response=TestClient(app).post('/api/corpus/speech',json={'text':'drifted away from'})
    assert response.status_code == 503
    assert 'key' not in response.text
