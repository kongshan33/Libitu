"""OpenAI transport/configuration contracts; never contact a paid provider."""
import asyncio
from contextlib import asynccontextmanager
import logging

import pytest

from app.config import Settings
from app.integrations import speaking_realtime


def test_openai_is_default_without_local_env_or_provider_override(monkeypatch):
    for name in ("SPEAKING_REALTIME_PROVIDER", "OPENAI_REALTIME_MODEL", "OPENAI_REALTIME_VOICE"):
        monkeypatch.delenv(name, raising=False)
    settings = Settings(_env_file=None)
    assert settings.speaking_realtime_provider == "openai"
    assert settings.openai_realtime_model == "gpt-realtime-2.1"
    assert settings.openai_realtime_voice == "marin"


def test_transport_uses_fixed_origin_private_header_and_silent_logger(monkeypatch):
    calls = []
    socket = object()

    @asynccontextmanager
    async def connect(url, **kwargs):
        calls.append((url, kwargs))
        yield socket

    monkeypatch.setattr(speaking_realtime, "connect", connect)

    async def run():
        settings = Settings.model_construct(openai_api_key="synthetic-key", openai_realtime_model="model&injected=1")
        async with speaking_realtime.open_realtime(settings) as result:
            assert result is socket

    asyncio.run(run())
    url, options = calls[0]
    assert url == "wss://api.openai.com/v1/realtime?model=model%26injected%3D1"
    assert options["additional_headers"] == {"Authorization": "Bearer synthetic-key"}
    assert "synthetic-key" not in url
    assert options["ssl"].check_hostname
    assert not options["logger"].propagate
    assert not options["logger"].isEnabledFor(logging.CRITICAL)


def test_missing_openai_key_fails_before_connecting(monkeypatch):
    def forbidden(*args, **kwargs):
        pytest.fail("Missing credentials must not open a provider connection")

    monkeypatch.setattr(speaking_realtime, "connect", forbidden)

    async def run():
        with pytest.raises(ValueError, match="not configured"):
            async with speaking_realtime.open_realtime(Settings.model_construct(openai_api_key=None)):
                pytest.fail("Missing credentials accepted")

    asyncio.run(run())
