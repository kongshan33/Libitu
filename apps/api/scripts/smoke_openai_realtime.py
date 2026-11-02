"""Opt-in OpenAI protocol smoke; synthetic input, no database or learner records.

Run from apps/api: .venv/bin/python -m scripts.smoke_openai_realtime --live
Add --voice for macOS say/ffmpeg synthetic microphone input. This checks the
production configuration/transport, not physical devices or teaching quality.
"""
import argparse
import asyncio
import base64
from datetime import datetime, timezone
import json
from pathlib import Path
import subprocess
import tempfile
from uuid import uuid4

from app.config import get_settings
from app.integrations.speaking_realtime import open_realtime, session_configuration
from app.schemas.speaking import SpeakingSession


async def receive(socket):
    event = json.loads(await socket.recv())
    if event.get("type") == "error":
        # Never print raw provider events, credentials, or audio.
        raise RuntimeError("OpenAI error: " + str(event.get("error", {}).get("code")))
    return event


async def wait_for(socket, *kinds):
    while True:
        event = await receive(socket)
        if event.get("type") in kinds:
            return event


async def send(socket, event):
    await socket.send(json.dumps(event))


async def response(socket, modality, *, cancel=False):
    await send(socket, {"type": "response.create", "response": {
        "output_modalities": [modality], "max_output_tokens": 450,
        "instructions": "Stay in role. Suggest meeting tomorrow in one brief sentence.",
    }})
    audio_bytes = 0
    cancelled = False
    truncated = False
    while True:
        event = await receive(socket)
        if event["type"] == "conversation.item.truncated":
            truncated = True
        if event["type"] == "response.output_audio.delta":
            audio_bytes += len(base64.b64decode(event["delta"]))
            if cancel and not cancelled:
                await send(socket, {"type": "response.cancel", "response_id": event["response_id"]})
                await send(socket, {"type": "conversation.item.truncate", "item_id": event["item_id"],
                                    "content_index": 0, "audio_end_ms": 0})
                cancelled = True
        if event["type"] == "response.done":
            result = event["response"]
            if result["status"] not in ({"cancelled", "completed"} if cancel else {"completed"}):
                error = (result.get("status_details") or {}).get("error") or {}
                raise RuntimeError("OpenAI response failed: " + str(error.get("code", result["status"])))
            text = "".join(c.get("transcript", c.get("text", ""))
                           for item in result.get("output", []) for c in item.get("content", []))
            if modality == "audio":
                assert audio_bytes > 0, "No output audio received"
            elif not text.strip():
                raise RuntimeError("No output text received")
            if cancel and not truncated:
                await wait_for(socket, "conversation.item.truncated")
            return {"status": result["status"], "audio_bytes": audio_bytes, "text_chars": len(text)}


async def exercise(pcm=None):
    settings = get_settings()
    mission = SpeakingSession(
        id=uuid4(), user_id="synthetic-openai-smoke", client_id=uuid4(),
        scenario_type="workplace", goal="Arrange a meeting with a colleague",
        difficulty="standard", feedback_level="balanced", logic_template=None,
        created_at=datetime.now(timezone.utc), items=[],
    )
    report = {"provider": "openai", "model": settings.openai_realtime_model,
              "voice": settings.openai_realtime_voice, "synthetic_input": True}
    # Fresh provider connections exercise restored assistant text as well as input.
    for mode in ("initial", "reconnect"):
        async with asyncio.timeout(60), open_realtime(settings) as socket:
            await wait_for(socket, "session.created")
            await send(socket, session_configuration(settings, mission))
            await wait_for(socket, "session.updated")
            if mode == "reconnect":
                await send(socket, {"type": "conversation.item.create", "item": {
                    "type": "message", "role": "assistant",
                    "content": [{"type": "output_text", "text": "Can we meet tomorrow?"}],
                }})
                await wait_for(socket, "conversation.item.added", "conversation.item.created")
                report["restored_text_reply"] = await response(socket, "text")
                continue
            report["opening_audio"] = await response(socket, "audio")
            report["interruption"] = await response(socket, "audio", cancel=True)
            if pcm is not None:
                async def stream():
                    data = bytes(24000) + pcm + bytes(96000)
                    for offset in range(0, len(data), 4800):
                        await send(socket, {"type": "input_audio_buffer.append",
                                            "audio": base64.b64encode(data[offset:offset + 4800]).decode()})
                        await asyncio.sleep(0.1)
                task = asyncio.create_task(stream())
                try:
                    await wait_for(socket, "input_audio_buffer.committed")
                    transcript = await wait_for(socket, "conversation.item.input_audio_transcription.completed",
                                                "conversation.item.input_audio_transcription.failed")
                    assert transcript.get("transcript", "").strip(), "Synthetic speech was not transcribed"
                    report["input_transcript_chars"] = len(transcript["transcript"])
                    await task
                finally:
                    task.cancel()
                    await asyncio.gather(task, return_exceptions=True)
            else:
                await send(socket, {"type": "conversation.item.create", "item": {
                    "type": "message", "role": "user",
                    "content": [{"type": "input_text", "text": "Tomorrow morning works for me."}],
                }})
            report["post_interrupt_audio"] = await response(socket, "audio")
            report["muted_text_reply"] = await response(socket, "text")
    return report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--live", action="store_true", help="Enable bounded paid OpenAI requests")
    parser.add_argument("--voice", action="store_true", help="Stream macOS synthetic speech through VAD/ASR")
    args = parser.parse_args()
    if not args.live:
        parser.error("Pass --live to enable paid requests.")
    pcm = None
    if args.voice:
        with tempfile.TemporaryDirectory(prefix="libitu-openai-smoke-") as directory:
            source, target = Path(directory) / "voice.aiff", Path(directory) / "voice.pcm"
            subprocess.run(["say", "-v", "Samantha", "-o", str(source),
                            "Tomorrow morning works for me. Let's meet at ten."], check=True)
            subprocess.run(["ffmpeg", "-v", "error", "-i", str(source), "-ar", "24000",
                            "-ac", "1", "-f", "s16le", str(target)], check=True)
            pcm = target.read_bytes()
    try:
        print(json.dumps(asyncio.run(exercise(pcm))))
    except Exception as error:
        # Only locally generated error descriptions are safe to print.
        print(json.dumps({"status": "failed", "error_type": type(error).__name__,
                          "reason": str(error) if type(error) in (RuntimeError, AssertionError) else "transport failure"}))
        raise SystemExit(1) from None


if __name__ == "__main__":
    main()
