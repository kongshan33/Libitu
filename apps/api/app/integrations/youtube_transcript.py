import math
from time import monotonic
from urllib.parse import parse_qs, urlsplit
from xml.etree.ElementTree import ParseError

from defusedxml import ElementTree
from requests import RequestException, Session, Timeout
from youtube_transcript_api import YouTubeTranscriptApi

from app.schemas.captions import CaptionEvent, CaptionSegment, CaptionTrack
from app.services.caption_source import has_word_intervals
from app.services.transcript_formatter import caption_track_to_text, format_timestamp_ms


class TranscriptUnavailableError(RuntimeError):
    pass


def fetch_youtube_transcript(video_id: str, language: str | None = None) -> str:
    """Compatibility adapter retaining millisecond starts in the plain text."""
    return caption_track_to_text(fetch_youtube_caption_track(video_id, language))


def fetch_youtube_caption_track(video_id: str, language: str | None = None) -> CaptionTrack:
    track = _fetch_track(video_id, language, timed_only=False)
    if track is None:
        raise TranscriptUnavailableError("YouTube returned an empty transcript.")
    return track


def find_import_caption_track(video_id: str, language: str | None, *, timed_only: bool) -> CaptionTrack | None:
    """Resolve a pasted URL before text analysis. A cached transcript only needs a timing upgrade."""
    try:
        return _fetch_track(video_id, language, timed_only=timed_only)
    except TranscriptUnavailableError:
        return None


class _CaptionSession(Session):
    def __init__(self):
        super().__init__()
        self.deadline = monotonic() + 7

    def remaining(self) -> float:
        remaining = self.deadline - monotonic()
        if remaining <= 0:
            raise Timeout("Caption lookup timed out.")
        return remaining

    def request(self, method, url, **kwargs):
        remaining = self.remaining()
        kwargs.setdefault("timeout", (min(2, remaining), min(3, remaining)))
        return super().request(method, url, **kwargs)


def _fetch_track(video_id: str, language: str | None, *, timed_only: bool) -> CaptionTrack | None:
    languages = _language_preferences(language)
    advertised = []

    def remember_tracks(response, **_):
        # The library strips fmt=srv3 during list construction. Retain the
        # provider's original URL only within this request, before that conversion.
        if response.request.method == "POST" and urlsplit(response.url).path == "/youtubei/v1/player":
            data = response.json()
            if data.get("videoDetails", {}).get("videoId") == video_id:
                advertised.extend(data.get("captions", {}).get("playerCaptionsTracklistRenderer", {}).get("captionTracks", []))

    try:
        with _CaptionSession() as session:
            session.hooks["response"].append(remember_tracks)
            available = YouTubeTranscriptApi(http_client=session).list(video_id)
            for lang in languages:
                for entry in advertised:
                    if entry.get("kind") != "asr" or entry.get("languageCode") != lang:
                        continue
                    track = _read_srv3(session, entry.get("baseUrl", ""), video_id, lang)
                    if has_word_intervals(track):
                        return track
            if timed_only:
                return None
            fetched = available.find_transcript(languages).fetch()
    except Exception as error:
        raise TranscriptUnavailableError(
            "YouTube captions are unavailable from both the browser and transcript provider."
        ) from error

    try:
        events = []
        for snippet in fetched:
            if not snippet.text.strip():
                continue
            start = float(snippet.start)
            duration = getattr(snippet, "duration", None)
            if not math.isfinite(start) or start < 0:
                raise ValueError("Invalid caption start.")
            if duration is not None and (not math.isfinite(float(duration)) or float(duration) < 0):
                raise ValueError("Invalid caption duration.")
            events.append(CaptionEvent(
                tStartMs=round(start * 1000),
                dDurationMs=round(float(duration) * 1000) if duration is not None else None,
                segs=[CaptionSegment(utf8=snippet.text)],
            ))
        generated = getattr(fetched, "is_generated", None)
        track = CaptionTrack(
            version="youtube-snippets-v1", video_id=video_id,
            language=getattr(fetched, "language_code", language),
            kind="asr" if generated is True else "manual" if generated is False else "unknown",
            events=events,
        )
    except (ValueError, TypeError, AttributeError) as error:
        raise TranscriptUnavailableError("YouTube returned invalid caption timing.") from error
    if not events:
        raise TranscriptUnavailableError("YouTube returned an empty transcript.")
    return track


def _read_srv3(session: _CaptionSession, url: str, video_id: str, language: str) -> CaptionTrack | None:
    parsed = urlsplit(url)
    query = parse_qs(parsed.query)
    if (parsed.scheme != "https" or parsed.netloc != "www.youtube.com"
        or parsed.path != "/api/timedtext" or query.get("fmt") != ["srv3"]
        or query.get("v") != [video_id] or "xpe" in query.get("exp", [])):
        return None
    try:
        with session.get(url, stream=True, allow_redirects=False) as response:
            if response.status_code != 200:
                return None
            body = bytearray()
            for chunk in response.iter_content(65536):
                session.remaining()
                body.extend(chunk)
                if len(body) > 2 * 1024 * 1024:
                    return None
        root = ElementTree.fromstring(body)
        if root.tag != "timedtext" or root.get("format") != "3":
            return None
        events = []
        for row in root.findall("./body/p"):
            segments = []
            if row.text:
                segments.append(CaptionSegment(utf8=row.text))
            for child in row:
                if child.tag != "s":
                    return None
                segments.append(CaptionSegment(utf8="".join(child.itertext()),
                    tOffsetMs=int(child.attrib["t"]) if "t" in child.attrib else None))
                if child.tail:
                    segments.append(CaptionSegment(utf8=child.tail))
            events.append(CaptionEvent(tStartMs=int(row.attrib["t"]), segs=segments,
                dDurationMs=int(row.attrib["d"]) if "d" in row.attrib else None,
                wWinId=int(row.attrib["w"]) if "w" in row.attrib else None,
                aAppend=int(row.attrib["a"]) if "a" in row.attrib else None))
        # SRV3 p/s elements above have been converted to our canonical
        # JSON3 event/segment representation, with native millisecond offsets.
        return CaptionTrack(version="youtube-json3-v1", video_id=video_id, language=language, kind="asr", events=events)
    except (RequestException, ParseError, ValueError, KeyError):
        return None


def _language_preferences(language: str | None) -> list[str]:
    if not language:
        return ["en", "en-US", "en-GB"]
    base = language.split("-")[0]
    return list(dict.fromkeys([language, base, "en", "en-US", "en-GB"]))


def _format_timestamp(start_seconds: float) -> str:
    return format_timestamp_ms(round(start_seconds * 1000))
