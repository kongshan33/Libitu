# 本地开发指南

[返回 README](../../README.md)

以下命令从仓库根目录开始。

### 1. 准备环境

- Node.js 22.18+（22.x）与 pnpm 10.19.0
- Python 3.11–3.14 与 [uv](https://docs.astral.sh/uv/)
- Clerk 开发应用，用于当前 Web 的登录集成
- Chrome，用于安装扩展和体验参考音频采集

```bash
git clone https://github.com/kongshan33/libitu.git
cd libitu
pnpm install

cd apps/api
uv sync --extra dev --extra acoustics
cd ../..
```

### 2. 配置环境变量

首次运行时复制配置模板；已有配置请直接编辑，避免覆盖：

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

基础开发模式需要配置：

| 文件 | 配置 |
| --- | --- |
| `apps/web/.env.local` | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`、`CLERK_SECRET_KEY`；保留 `NEXT_PUBLIC_LIBITU_API_BASE_URL=http://localhost:8000` |
| `apps/api/.env` | 同一 Clerk 应用的 `CLERK_SECRET_KEY`；保留 `CLERK_AUTHORIZED_PARTIES=http://localhost:3000` 和 `PROCESSING_MODE=inline` |

`inline` 使用确定性的开发数据和内存存储，适合查看界面和调试接口；它不执行真实的视频 AI 分析，也不提供完整的持久化、语音分析和实时对话体验。

### 3. 启动 Web 和 API

在仓库根目录分别打开两个终端：

```bash
# 终端 1：API
pnpm --filter @libitu/api dev:server
```

```bash
# 终端 2：Web
pnpm --filter @libitu/web dev
```

访问 [Web 应用](http://localhost:3000) 或 [API 文档](http://localhost:8000/docs)。

### 4. 按需启用完整功能

在 `apps/api/.env` 中补齐对应配置，具体变量见 [API 配置模板](../../apps/api/.env.example)：

| 功能 | 额外配置 |
| --- | --- |
| 持久化数据与练习记录 | 配置自己的 Supabase 项目，按顺序应用 `supabase/migrations` 中的迁移，填写 `SUPABASE_URL` 和 `SUPABASE_SECRET_KEY` |
| 真实视频分析 | 在持久化配置基础上设置 `PROCESSING_MODE=queue`，填写 Upstash REST URL / Token 和 `DEEPSEEK_API_KEY`；运行 `pnpm --filter @libitu/api setup:punctuation` 准备字幕标点模型 |
| AI 语音对话与会话报告 | 在持久化配置基础上填写 `OPENAI_API_KEY` 和 `DEEPSEEK_API_KEY`，保留 `SPEAKING_REALTIME_PROVIDER=openai`；确认所配置模型在自己的服务账号中可用 |
| 服务端跟读分析 | 在持久化配置基础上安装 FFmpeg、MFA 并准备 ASR、声学模型与词典；配置模型路径和校验值，见 [声学运行说明](../../apps/api/deploy/README.md) |

文本任务默认使用 `TEXT_ANALYSIS_PROVIDER=deepseek`、`DEEPSEEK_API_KEY` 和 `DEEPSEEK_MODEL=deepseek-flash`。可显式设置 `TEXT_ANALYSIS_PROVIDER=ark`，使用 `ARK_API_KEY` / `ARK_MODEL` 对比或回退；现有 `ARK_*` 预算配置约束两家服务。Corpus 详情保留独立的 `CORPUS_ANALYSIS_PROVIDER` / `CORPUS_DEEPSEEK_MODEL`。语音继续使用独立的 OpenAI 配置。切换后重启 API 和 blueprint / feedback workers；旧结果不会自动重生成。实测与未解决的质量问题见 [对比报告](../benchmarks/text-providers-20261106/COMPARISON.md)。

Stage 5 默认启用 `DEEPSEEK_ASSESSMENT_STRICT=true`，结合固定字段、原文证据 ID、本地校验和最多一次 15 秒定向修复。Stage 4/5 共用确定性表达匹配，语境是否合适仍单独判断。30 个用例各重复 3 次的修复前后对比见 [质量与速度报告](../benchmarks/text-quality-20261106/COMPARISON.md)；本轮 Doubao 因账户欠费返回 403。

只启用视频分析或对话时，可在 Web/API 之外按需启动 worker：

```bash
pnpm --filter @libitu/api worker
pnpm --filter @libitu/api worker:feedback
```

每个 worker 在独立终端运行。完成全部服务和声学模型配置后，可改用根目录的 `pnpm dev` 统一启动 Web、API、视频分析、会话报告和两条声学 worker。**未配置数据库或声学模型时，请使用前面的分开启动方式。**

AI 功能需要使用你自己的服务账号和凭据，可能产生调用费用。密钥仅放在本地环境文件中，不要提交到仓库。

### 5. 安装 Chrome 扩展（可选）

1. 打开 Chrome 的 `chrome://extensions`，启用开发者模式。
2. 点击「加载已解压的扩展程序」，选择仓库中的 `apps/extension`。
3. 打开英语 YouTube 视频，点击播放器中的 Libitu 按钮或扩展工具栏图标。

扩展默认连接 `http://localhost:3000`。参考音频采集需要按页面提示显式授权；Web 或扩展更新后，请重载扩展并刷新相关页面。详见 [扩展说明](../../apps/extension/README.md)。

