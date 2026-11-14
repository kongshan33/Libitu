# Local development guide

[Back to README](../../README.en.md)

Start the commands below from the repository root.

### 1. Prerequisites

- Node.js 22.18+ (22.x) and pnpm 10.19.0
- Python 3.11–3.14 and [uv](https://docs.astral.sh/uv/)
- A Clerk development application for the current Web authentication integration
- Chrome for the extension and reference-audio capture

```bash
git clone https://github.com/kongshan33/libitu.git
cd libitu
pnpm install

cd apps/api
uv sync --extra dev --extra acoustics
cd ../..
```

### 2. Configure environment variables

Copy the templates on first setup. If configuration files already exist, edit them instead of overwriting them:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

For basic development, configure:

| File | Configuration |
| --- | --- |
| `apps/web/.env.local` | Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`; keep `NEXT_PUBLIC_LIBITU_API_BASE_URL=http://localhost:8000` |
| `apps/api/.env` | Set `CLERK_SECRET_KEY` from the same Clerk application; keep `CLERK_AUTHORIZED_PARTIES=http://localhost:3000` and `PROCESSING_MODE=inline` |

`inline` uses deterministic development data and in-memory storage for exploring the UI and API. It does not run real AI video analysis or provide the complete persistence, speech analysis, and live conversation experience.

### 3. Start the Web app and API

Open two terminals at the repository root:

```bash
# Terminal 1: API
pnpm --filter @libitu/api dev:server
```

```bash
# Terminal 2: Web
pnpm --filter @libitu/web dev
```

Open the [Web app](http://localhost:3000) or [API documentation](http://localhost:8000/docs).

### 4. Enable additional features

Add the relevant settings to `apps/api/.env`. See the [API environment template](../../apps/api/.env.example) for variable names:

| Feature | Additional setup |
| --- | --- |
| Persistent data and practice history | Configure your own Supabase project, apply the migrations in `supabase/migrations` in order, and set `SUPABASE_URL` and `SUPABASE_SECRET_KEY` |
| Real video analysis | With persistence configured, set `PROCESSING_MODE=queue`, the Upstash REST URL / token, and `DEEPSEEK_API_KEY`; run `pnpm --filter @libitu/api setup:punctuation` to prepare the subtitle punctuation model |
| AI voice conversations and session reports | With persistence configured, set `OPENAI_API_KEY` and `DEEPSEEK_API_KEY`, and keep `SPEAKING_REALTIME_PROVIDER=openai`; check that your provider account has access to the configured models |
| Server-side shadowing analysis | With persistence configured, install FFmpeg and MFA, prepare the ASR model, acoustic model, and dictionary, and configure their paths and checksums; see the [acoustic runtime guide](../../apps/api/deploy/README.md) |

Text tasks default to `TEXT_ANALYSIS_PROVIDER=deepseek`, `DEEPSEEK_API_KEY`, and `DEEPSEEK_MODEL=deepseek-flash`. Set `TEXT_ANALYSIS_PROVIDER=ark` explicitly to compare or fall back to `ARK_API_KEY` / `ARK_MODEL`; existing `ARK_*` budget settings constrain both providers. Corpus detail retains separate `CORPUS_ANALYSIS_PROVIDER` / `CORPUS_DEEPSEEK_MODEL` overrides. Voice uses independent OpenAI settings. Restart the API and blueprint / feedback workers after switching; saved results are not regenerated automatically. See the [provider comparison](../benchmarks/text-providers-20261106/COMPARISON.md) for measurements and unresolved quality issues.

Stage 5 defaults to `DEEPSEEK_ASSESSMENT_STRICT=true`, combining fixed fields, source evidence IDs, local validation, and at most one targeted 15-second repair. Stages 4 and 5 share deterministic expression matching; contextual appropriateness is assessed separately. See the [quality and latency report](../benchmarks/text-quality-20261106/COMPARISON.md) for a before/after comparison of 30 cases repeated three times. Doubao returned account-overdue 403 responses during that comparison.

For video analysis or conversations, start the workers you need alongside the Web app and API:

```bash
pnpm --filter @libitu/api worker
pnpm --filter @libitu/api worker:feedback
```

Run each worker in a separate terminal. Once all services and acoustic models are configured, use `pnpm dev` at the root to start the Web app, API, video analysis, session reports, and both acoustic workers together. **Until the database and acoustic models are configured, use the separate startup commands above.**

AI features require your own provider accounts and credentials and may incur usage charges. Keep secrets in local environment files and out of Git.

### 5. Install the Chrome extension (optional)

1. Open `chrome://extensions` in Chrome and enable Developer mode.
2. Click **Load unpacked** and select `apps/extension` from the repository.
3. Open an English YouTube video and click the Libitu player button or toolbar icon.

The extension connects to `http://localhost:3000` by default. Reference-audio capture requires explicit permission through the on-screen setup. After updating the Web app or extension, reload the extension and refresh the relevant pages. See the [extension guide](../../apps/extension/README.md).

