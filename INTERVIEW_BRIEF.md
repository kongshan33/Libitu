# Libitu 面试挖掘指南

> 本文是面试准备用的分析稿，不属于产品活文档（活文档见 `PROJECT.MD` / `TASK.MD` / `DECISIONS.MD`）。
> 结论优先：**这个项目最值钱的不是"用了哪些 AI 服务"，而是三件事——把不可靠的 LLM 输出变成可验证的结构化数据、把有状态的长连接做成可恢复的服务端资源、以及在无法证明效果的地方明确说"不知道"。**

---

## 0. 一句话定位

Libitu 是一个英语"输出能力"训练产品：把 YouTube 视频和文章里的真实表达抽取成个人语料（chunk / idiom / structure），再通过逐句跟读（声学反馈）和 AI 情景对话（实时语音）让学习者真正用出来。

三条闭环，正好对应三个技术难点：

| 闭环 | 用户动作 | 技术难点 |
|---|---|---|
| 输入 | 粘贴 YouTube 链接 / 装扩展 | 字幕获取的合法性与可靠性、长文本流式结构化抽取 |
| 语料 | 收藏、编辑、复用表达 | 来源可追溯、去重、与原文对齐 |
| 输出 | 跟读 + AI 角色扮演 | 实时双工语音、教学策略注入、证据可核验的评分 |

---

## 1. 先背下来的事实卡

面试里报数字要准，下面这些都能在仓库里对上：

- **规模**：monorepo（pnpm 10.19 + Turborepo），4 个 workspace 应用/包组。
  - `apps/api`：FastAPI + Pydantic v2，`app/` 下约 **20,600 行 Python**。
  - `apps/web`：Next.js 15 + React 19 + TS strict，`features/` 下约 **16,400 行** TS/TSX。
  - `apps/extension`：Manifest V3，13 个源模块（含 MAIN world 观察器、offAudio offscreen 管线）。
  - `supabase/migrations`：**34 个迁移**，8 个含 RLS 策略。
- **测试**：API 侧 **907 个 `def test_`**（文档记录单次全量运行 1,100–1,600 个用例区间），Web 侧 20+ 个 `node:test` 文件，扩展 10 个 `.test.mjs`。
- **技术栈**：Supabase Postgres + RLS、Clerk 身份、Upstash Redis、豆包（Volcengine Ark）文本、Gemini Live 实时语音、faster-whisper + MFA + Silero VAD + Praat 声学。
- **状态**：本地开发阶段，未上线、无真实用户数据。**这点必须主动说**，它决定了你所有指标的口径。

---

## 2. 架构全景（白板要能画出来）

```
Chrome 扩展 (MV3)                    Web (Next 15 / React 19)              API (FastAPI)
┌──────────────────┐   handoff    ┌──────────────────────────┐   HTTPS   ┌─────────────────────┐
│ MAIN world 观察器 │─────────────▶│ /practice/import         │──────────▶│ 路由层 routers/      │
│ 被动复制 JSON3 字幕│  短时票据    │ /practice/{id}[/segments]│           │  ↓                  │
│ offscreen 音频采集 │              │ /practice/{id}/shadow    │           │ 服务层 services/     │
└──────────────────┘              │ /loadout /speaking/{id}  │◀─WS──────▶│  ↓                  │
                                   └──────────────────────────┘           │ 集成层 integrations/ │
                                                                          └──────────┬──────────┘
                                                                                     │
                        ┌────────────────┬──────────────────┬────────────────────────┤
                        ▼                ▼                  ▼                        ▼
                  Supabase PG      Upstash Redis      Ark (豆包文本)          Gemini Live
                  RLS + CAS 函数    队列/锁/心跳       SSE 流式 JSON           双向音频 WebSocket
                        │
                        ▼
              4 类后台 worker（blueprint / practice_analysis / speaking_feedback / acoustic）
```

分层约定很硬（`CLAUDE.MD`）：`routers` 只做协议、`schemas` 只做契约、`services` 做编排、`integrations` 做外部适配。**面试时可以拿这个说"我能守住分层边界"**。

---

## 3. 十个可深挖的技术点（按面试区分度排序）

### ★★★ 1. 流式 LLM 结构化抽取：partial JSON + 单调预览 + 局部降级

**表面说法**：「用豆包把字幕抽成 JSON。」

**真正的难点**：流式 token 是半截 JSON，Pydantic 无法校验；同时用户要看到"边生成边出现"的效果；而最终结果必须严格合法。三个目标互相冲突。

**关键实现**（`apps/api/app/integrations/ark_analysis.py`，601 行）：

1. **部分解析**：用 `pydantic_core.from_json(..., allow_partial=True)` 把半截 JSON 解析成 dict，而不是等流结束。
2. **单调合并**：`_merge_analysis_preview()` 对前后两次预览取 `max`（chapters/logic_flow/corpus_items 只保留更长的那个），保证 UI 上的列表**永不回退**——否则会出现"内容闪一下又消失"。
3. **节流 + 签名去重**：每 0.4s 才构造一次预览，并用 `_preview_signature()`（summary + 各列表长度 + `output_chars // 2000`）判重，避免高频无效渲染。
4. **最终严格校验**：流结束后走 `_parse_analysis_payload`，检查 `finish_reason`：`length` → `analysis_response_truncated`（可重试）、`stop` 之外 → 不可重试或按需重试。
5. **重试时放大预算**：`max_tokens = min(base * (attempt + 1), 64_000)`——截断的根因往往是输出预算不够，所以第 N 次给 N 倍预算，而不是原样重试。
6. **归一化后再校验**（这是最容易讲出彩的地方）：
   - 列表截断（chapters ≤12、corpus_items ≤32…）
   - `structure` 类型的占位符统一：`<{...}>` → `[...]`
   - chunk 的 `text` 与 `source_text` 对不上时，**拿归一化后的字幕做双向核对**，谁能在原文里找到就以谁为准
   - `_retain_valid_corpus_items()`：**逐条校验，丢掉坏的、保留好的**，并打印 `ark_analysis_corpus_items_dropped` 结构化日志（含丢弃数与字段路径）

**权衡**：预览是"尽力而为、不可信"的，只有最终校验通过的才写库。宁可预览少一条，不可最终错一条。

**面试官会追问**：
- 「为什么不用 `response_format=json_schema` 就完事？」→ 结构化输出保证语法，不保证**语义与原文一致**；所以还要做 source_text ⊆ transcript 的核对。模型仍会编造不存在的句子。
- 「部分解析失败怎么办？」→ 失败就退化成空预览，不阻断主流程；预览异常被 `_emit_analysis_progress` 捕获并只记日志类型，不影响生成。
- 「重试会不会重复计费/重复写？」→ 重试在 worker 内，写库是幂等的 blueprint key（content_id + analysis_version）。

---

### ★★★ 2. Redis 任务状态机：Lua 脚本做原子 CAS + 单调性约束

**表面说法**：「用 Upstash Redis 做队列。」

**真正的难点**：同一份任务状态有多个写入者（API 内联路径、worker、缓存发布器），且任务有重试、有终态。**一个迟到的旧写入不能把 `ready` 改回 `pending`，不能把第 3 次重试覆盖成第 2 次。**

**关键实现**（`apps/api/app/integrations/processing_queue.py`）：

- `_JOB_WRITE` 是一段 Lua，**一次 `EVAL` 同时更新任务键和索引键**（索引键用于 `find_job(content_id, analysis_version)`），避免两次写之间的窗口。
- 三种模式：`create`（已存在就返回旧值，实现幂等创建）、`compare`（要求 attempt_count 与 status 都匹配，否则返回 false）、`publish`（默认路径，带单调性检查）。
- **单调性规则**（脚本第 77-80 行）：
  ```lua
  if old.attempt_count > candidate.attempt_count or
     (old.attempt_count == candidate.attempt_count and
       ((old.status == 'ready' or old.status == 'failed') and old.status ~= candidate.status or
        old.status == 'processing' and candidate.status == 'pending')) then return raw end
  ```
  翻译成一句话：**attempt 只增不减；同 attempt 下终态不可回退；processing 不可退回 pending。**
- 身份不可变：`content_id` / `analysis_version` 变化直接 `redis.error_reply`。
- 锁与去重：`SET NX EX` 做 job 锁；`LPOS` 检查后再 `RPUSH` 防止重复入队；worker 心跳键带 TTL 做存活探测。

**权衡（要主动说）**：Upstash 是 REST 接口，没有阻塞式 `BRPOP`，所以是「LPOP + 锁 + 幂等写入」的至少一次语义，**不是** 生产级可恢复队列。`PROJECT.MD` 里也明确写了 "production queue recovery" 尚未成立。这种"我知道它的边界"比硬吹更值钱。

**面试官会追问**：
- 「为什么不用 Redis Streams / SQS？」→ 阶段目标是零运维 + 按量计费；Streams 需要 consumer group 管理，SQS 需要另建云资源。当前瓶颈不在队列语义，在模型延迟。
- 「Lua 里 `cjson.decode` 大 JSON 会不会阻塞 Redis？」→ 会。文档体积受 `processing_state_ttl_seconds` 与输入上限约束；如果状态继续变大，应该拆成 hash 字段而不是整包 JSON。

---

### ★★★ 3. 服务端持有的实时语音会话：票据 + 代际 + DB 租约

**表面说法**：「接 Gemini Live 做语音对话。」

**真正的难点**：浏览器直连厂商会泄露密钥，也无法注入教学策略、无法捕获证据；但代理长连接后，**会话状态变成了分布式资源**——重连、接管、多标签页、worker 重启、超时，都要正确。

**关键实现**：

- **一次性票据**（`speaking_runtime_state.py:122`）：`base64(json([owner, random32]))`，只把 `sha256(ticket)` 存进会话文档，30 秒过期，`hmac.compare_digest` 比对，用掉即置 `ticket_used`。**注释写得很清楚：票据里的 owner 在整张票据校验通过前不可信，绝不作为身份凭据。**
- **代际隔离**：每次连接生成新 `runtime_id` + 递增 `generation`，旧连接的所有写入都会被 `fence()` 判为过期（`RuntimeStopped`）。
- **DB 级 CAS**（迁移 `20261001111236_speaking_runtime_state.sql`）：
  - `cas_speaking_runtime(...)` 先 `SELECT ... FOR UPDATE` 锁父行，再比 `version`，冲突抛 `PT409`；
  - 约束：文档必须是 object、≤1MB、version ≤ `9007199254740991`（JS 安全整数，避免前端精度丢失）；
  - **所有变更（含 DELETE）都先锁父行**，避免删除与写入交错。
- **应用层重试**：`mutate()` 最多 6 轮「读 → 纯函数变更 → CAS」，且强制要求 operation 内**不得有 await / 模型调用**，这样重放才安全。
- **接管语义**：已有活跃连接时，第二次连接必须显式 `takeover`，且会调用 `interrupt_unheard()` 把"已发送但未确认播放"的 AI 消息标为 `interrupted`——**没被听到的话不能进评分证据**。

**权衡**：把整个会话文档塞进一个 JSONB，换来"一次 CAS 提交一整个事务"，代价是写放大和 1MB 上限。规模上去要按消息表分片。

**面试官会追问**：
- 「为什么不用数据库事务包住整轮对话？」→ 长连接不能持有事务；所以用「短事务 + 乐观版本 + 应用层重放」。
- 「CAS 冲突频繁怎么办？」→ 单会话的写入者是串行的（一个 WS 连接），冲突主要来自 HTTP 侧并发操作，6 次重试足够；真的冲突就返回 409 让用户重试，而不是无限自旋。
- 「服务端代理音频，延迟怎么控制？」→ 音频帧不做 JSON 解析以外的处理，`send`/`upstream` 各自独立锁（`send_lock` / `provider_lock`），避免和状态写入互相阻塞；播放确认等高频回执**绕过 provider 锁**（这是文档里记录的一次真实修复）。

---

### ★★★ 4. 教学策略引擎：旁路异步分析 + 确定性兜底

**表面说法**：「AI 会在对话中引导你用目标表达。」

**真正的难点**：教学要"自然地发生"，但模型调用要 12 秒；如果阻塞对话就毁了体验，如果不加约束模型就会直接说出答案。

**关键实现**（`services/speaking_teaching.py`，1030 行）：

- **异步旁路**：每条 final 用户话语触发一次豆包分析（`ANALYSIS_TIMEOUT_SECONDS = 12`），与 Gemini 的回复**并行**，只影响"未来的回复"，不改当前正在生成的内容。
- **节流策略**：前 2 条实质话语只观察不教学（`OBSERVATION_TURNS = 2`）；同一目标最多提示 2 次（`MAX_PROMPTS_PER_ITEM`）；冷却 2 轮（`PROMPT_COOLDOWN_TURNS`）；策略 TTL 45 秒、最多跨 2 轮（`POLICY_TTL_SECONDS` / `POLICY_MAX_FUTURE_TURNS`）。
- **反泄题约束**：prompt 里明确要求 `intent` / `opportunity` / `skip_when` **不得包含被选表达、句式框架或示范答案**，只能描述"交际意图"。
- **确定性后置检查**：回复生成后跑一遍目标词披露检测，**在音频发出前不阻塞**，只做标记。这是"LLM 合规不可信"的工程承认。
- **证据锚定**：模型只允许返回原文引用，UTF-16 偏移由服务端从**唯一出现位置**推导；重复引用无法消歧就直接丢弃。
- **保守的度量口径**：区分「独立使用 / 确认示范后的模仿 / 其他协助 / 曝光不确定」。**不叫掌握度，不叫教学效果**。

**这条最值得讲，因为它有真实的失败证据**：`PROJECT.MD` 记录了一次 live probe——跨轮投递成功，但 Gemini 在被要求"隐式教学"时仍然直接说出了目标表达，评估为 `not_reflected`。于是团队加了确定性检查。**"我上线后发现模型不听话，于是把关键约束从 prompt 里挪到代码里"** 是一个极强的面试故事。

**面试官会追问**：
- 「为什么不用一个模型同时回复和教学？」→ 实时语音模型的首 token 延迟敏感，混入分析会拖慢开口；且教学需要更长的上下文窗口和不同的输出契约。
- 「怎么防止模型编造学生说过的话？」→ 引用必须逐字命中唯一位置，否则证据作废；评估侧还要求"引用的消息必须是 final 且 revision 匹配"。
- 「这套策略有效吗？」→ 明确回答：**没有对照实验，不能声称有效**。只有"策略被正确投递/被正确评估"的工程证据。

---

### ★★★ 5. 评分不可被模型污染：引用校验 + 服务端算分 + null 语义

**表面说法**：「用 LLM 给会话打分。」

**真正的难点**：LLM-as-judge 的三类作弊/漂移——编造证据、漏报以抬高百分比、把改写当使用。

**关键实现**（`services/speaking_assessment.py`，646 行）：

1. **只收引用，不收坐标**：模型返回 `quote`，服务端用 `text.find()` 找**唯一**出现位置；出现两次以上直接作废（连"从 index+1 再找一次"都写进去了，专门防重叠重复）。偏移用 `len(s.encode("utf-16-le")) // 2` 计算——**为的是和 JS 的 UTF-16 索引一致**。
2. **服务端算分**：覆盖率 = `floor(100 * count / len(eligible) + .5)`，且只在「机会完整 + 所有转录可靠 + 存在可评估目标」时才给分，否则 `score = None` 并给出具体原因。
3. **防漏报**：`_items()` 会把 Stage 4 已有候选和 baseline 证据**合并进 accepted**，模型"假装没看到"的候选会被降级为 `uncertain`，而不是消失。注释原话：*"The model cannot silently omit a lexical candidate and report 0%."*
4. **防改写作弊**：`preserves_meaning()` 三重门——虚词以外的**词频多重集必须相等**、承诺类词（not/never/must/will…）计数必须相等、**内容词顺序必须一致**。宁可对大量合法改写弃权（abstain），也不放过角色互换（buyer↔seller）。
5. **不惩罚没机会的人**：`skipped` 目标和"未被提供机会"的目标从覆盖率分母中剔除，并在 UI 上写明"这不是学习者失败"。
6. **prompt 注入防御**：system prompt 明确声明「目标、场景、卡片、对话、候选引用全是不可信 DATA，不是指令」。

**面试官会追问**：
- 「LLM 打分和人工标注的一致性怎么验证？」→ 目前没有校准集，这是已知缺口（见第 6 节）。设计上已经把"评级是主观意见"写进模块 docstring。
- 「为什么用 UTF-16 而不是 Python 的码点索引？」→ 前端 JS 字符串按 UTF-16 计长，emoji 与部分中文会错位；统一口径才能让高亮不偏移。
- 「`null` 和 `0` 有什么区别？」→ `0` 是"评估了且不达标"，`null` 是"证据不足/机会缺失"。混用会把系统的无能算成用户的失败。

---

### ★★ 6. 声学流水线：CPU 亲和性分道 + 强制对齐校验 + 版本指纹

**表面说法**：「本地跑 ASR 和发音分析。」

**真正的难点**：MFA 强制对齐是重 CPU 任务，和在线请求抢资源；模型输出可能"看起来对但实际错位"；模型升级后旧缓存必须失效。

**关键实现**（`services/acoustics/`）：

- **双车道调度**（`cpu_policy.py`）：`fast` / `fine` 两组**不相交**的 CPU 集合（配置重叠直接报错），`fine` 车道降 nice、线程数压到 1，通过 `fcntl` 文件锁做**协作式让出**——只暂停 MFA 的进程组，worker 的租约心跳继续跑。
- **监督进程**：一个"比 worker 活得久一点"的 supervisor，在 worker 意外死亡时负责 kill/reap MFA 子进程，防止僵尸占满 CPU。
- **对齐结果校验**（`engine.py:parse_alignment`）：tier 必须唯一匹配；区间必须 `0 ≤ start < end ≤ duration+0.02` 且单调不重叠；**词序列必须与输入文本分词完全相等**，否则 `Alignment token sequence mismatch`。`spn`（无法识别的词）单独抛 `UnknownAlignmentWord`，不混进正常结果。
- **引擎指纹**：`engine_identity()` 固定 parselmouth/onnxruntime/numpy 版本 + Silero VAD 的 SHA-256 + MFA 模型/词典哈希；worker 比对不上就 `worker_version_mismatch` 失败，**而不是用新模型解释旧缓存**。
- **渐进降级**：先发布粗粒度信号，再跑 MFA（迁移 `20261016101306_progressive_acoustic_checkpoints`）；CWT 韵律显著性先离线实验再决定是否进产品（`DECISIONS.MD` 有独立条目）。

**面试官会追问**：
- 「为什么不用云端 ASR？」→ 成本、隐私（学习者录音）、以及需要 phone-level 时间戳，通用 ASR 的置信度给不了。
- 「CPU 分道真的有用吗？」→ 讲清楚目标：让交互式请求不被离线批处理饿死；这是资源隔离问题，不是算法问题。

---

### ★★ 7. Chrome 扩展：MAIN world 被动观测 + 版权边界

**表面说法**：「扩展从 YouTube 拿字幕。」

**真正的难点**：YouTube 字幕接口需要签名 token，直接抓取既脆弱又有合规风险。

**关键实现**（`apps/extension/src/youtube-caption-observer.js`）：

- `document_start` + `world: "MAIN"` 注入，**包裹 `fetch`/`XHR` 被动复制播放器自己已经发出的 JSON3 响应**。注释第一句就划了红线：*"never replay a URL, manufacture tokens or control playback"*。
- **只留身份，不留凭证**：`identity()` 只提取 `videoId / lang / kind`，注释明确「完整 URL 和签名参数不进入缓存」。
- **有界内存**：单条 ≤2MB、缓存 ≤4MB、TTL 15 分钟、拷贝超时 2 秒；`generation` 计数器在 SPA 切换视频时整体失效。
- **语言门禁**：`/^en(?:-[a-z0-9]{2,8})*$/` 只放行英语变体，非英语给出明确原因而不是静默失败。
- **多级降级**：浏览器字幕 → 短时 handoff → 服务端非官方 provider，并且显式区分「装得太晚 / 未观测到 / 响应失败」三种状态。

**面试官会追问**：
- 「YouTube 改版怎么办？」→ 会坏。这是**已知脆弱性**，所以做了多级降级和显式失败态，而不是假装稳定。
- 「测试怎么保证？」→ 扩展测试基于拦截的 fixture，文档里诚实写了「fixture 通过不等于线上可用」。这种表述本身就是加分项。

---

### ★★ 8. 前端：单媒体所有者 + 竞态治理

**表面说法**：「Next.js 写页面。」

**真正的难点**：`/practice/{id}` 下的 `page` / `segments` / `shadow` 三个子路由共享同一个视频，**不能因为路由切换重新挂载 iframe**（会打断播放、丢进度）。

**关键实现**：

- **共享 layout + 单一 MediaHost**：控制器和媒体宿主上提到 content layout，子路由只换侧栏内容；iframe 的滚动链通过原生滚动转发到中间面板。
- **渐进揭示**：同一帧内的多个预览**合并成一次非紧急 React 更新**；用稳定 identity 防止已完成行重复播放动画；完成/取消时清空队列；只动 `opacity`/`transform`，尊重 `prefers-reduced-motion`。
- **会话控制器**（`features/speaking/controller.ts`，411 行）：
  - `epoch` 守卫所有异步回调，防止旧连接的事件污染新连接；
  - workspace 版本**单调接受**（`workspace.version < 当前` 直接丢弃）；
  - `retiredHints` 集合让"已作废的提示卡"无法被迟到的快照复活；
  - support 变更是带 `expectedVersion` 的乐观提交，回来时校验版本递增才算确认。
- **构建隔离**：`next dev` 用 `.next`，`next build` 用 `.next-build`——**跑构建验证不会踩坏正在运行的 dev server**。这种小设计在面试里很好用，说明你踩过坑。

---

### ★★ 9. LLM 延迟工程：少生成、局部修复、缓存键

**表面说法**：「生成练习场景有点慢，优化了一下。」

**真正的难点**：LLM 生成是长尾延迟，靠加机器没用，只能**减少生成量 + 减少往返**。

**关键实现**（`services/speaking_planning.py`，845 行）：

- **一键开始只要 1 个候选场景**，手动比较才要 2 个（候选数直接线性影响延迟）。
- **planning v5 只允许一次"字段级修复"**：已验证正确的字段/场景不动，服务端指定修补位置，合并后的完整 plan 必须重新通过校验；**JSON 结构坏了就直接失败并保留选择**，不做整体重生成。
- **请求数 9 → 5**：一次 owner 过滤的批量读语料、一次存 plan、一次创建、两次工作区读（原本 9 次 DB HTTP 往返）。
- **缓存键设计**：难度 / 反馈等级 / 逻辑模板 / 支持等级变化**复用** plan；场景偏好、目标顺序与角色、源内容变化则**失效**。这个划分是"哪些是展示层、哪些是内容层"的直接体现。
- **可观测**：服务端分阶段耗时 + 关联 request ID 打到浏览器 `Performance` measure，含缓存命中与 click-to-ready；**不记录学习者文本**。

**可引用的实测数**（注意口径）：5 目标真实 Ark 请求 18.01s（13.85s 生成 + 4.11s 本地修复），注入的单字段修复 2.46s；hosted 冒烟 11.47s 规划 / 0.32s 创建 / 0.63s 读。**这些是单次样本，不是分位数**——说的时候要带上这句。

---

### ★★ 10. 工程治理：文档即契约 + 主动声明验证边界

这一条在资深面试官眼里权重很高。

- 四份活文档分工明确：`PROJECT.MD`（实现真相）、`TASK.MD`（里程碑与验收）、`DECISIONS.MD`（跨切面决策）、`design/docs/*`（产品与系统契约）。
- **每条结论都带验证边界**，例如："synthetic fixtures are not proof of live behavior"、"the underlying provider error is unclassified"、"no application deployment or learning-effect validation is implied"。
- **诚实标注未完成项**：Clerk↔Supabase 托管信任待确认、队列恢复未实现、豆包文本质量评估缺失、真实麦克风时序未测。
- 测试策略：`PROCESSING_MODE=inline` 用确定性内存存储，**测试永不调用 Upstash / YouTube / 付费模型**——这让 900+ 个测试能在 CI 里稳定跑。

**怎么讲**：「我刻意把'已实现'和'已验证'分开写。因为这个项目大量依赖外部模型，最容易犯的错是把一次跑通当成能力成立。」

---

## 4. 三条招牌故事（STAR，背下来）

### 故事 A：让流式 JSON 边生成边显示，且永不回退
- **S**：字幕分析要 20+ 秒，用户盯着空白页会以为卡死。
- **T**：在流式 token 上做渐进展示，同时保证最终数据严格合法。
- **A**：`allow_partial` 解析半截 JSON → 0.4s 节流 → 按"只增不减"合并前后预览 → 签名去重 → 流结束走严格校验 + 归一化 + 逐条保留有效语料。
- **R**：UI 从"等 20 秒"变成"1 秒内开始出现结构"；预览回退导致的闪烁问题消失；坏条目不再导致整份蓝图失败，只丢单条并留结构化日志。
- **反差点**：预览层故意"不严格"，最终层故意"很严格"——两层容错等级不同，是刻意的。

### 故事 B：把长连接会话做成可恢复的服务端资源
- **S**：语音对话必须服务端代理（密钥 + 策略注入 + 证据捕获），但代理后就出现重连、接管、多标签页、进程重启。
- **T**：任何时刻只能有一个有效连接，任何写入都不能来自已失效的连接。
- **A**：一次性票据（哈希存储、30s TTL、用后置位）+ `runtime_id`/`generation` 代际 + Postgres 函数级 CAS（父行 `FOR UPDATE` + 版本比较）+ 应用层 6 次纯函数重放；接管时把未确认播放的消息标为 `interrupted`。
- **R**：刷新/换设备不会产生双写；没被听到的 AI 台词不会被算成"学习者没回应"；所有状态变更都能在单次事务里完成。
- **反差点**：真正的难点不是 WebSocket，是**"谁有权写"这个问题**。

### 故事 C：模型不听话，于是把约束从 prompt 挪进代码
- **S**：要求 AI 隐式引导学习者使用目标表达，不能直接说出来。
- **T**：既要自然，又不能泄题。
- **A**：先做 live probe 验证 → 发现 Gemini 在被约束的情况下仍然直接说出了目标表达（评估 `not_reflected`）→ 加入回复后的确定性披露检测，并在 prompt 里把"交际行为"显式指派给学习者、把目标措辞从初始配置中移除。
- **R**：后续 probe 中策略跨轮生效、AI 用提问代替示范、确定性检查 + 咨询式评估双双通过。
- **反差点**：**"我测了，它失败了，所以我改了架构"**——这比任何"我们实现了 XX"都更能证明工程判断力。

---

## 5. 高频追问速查表

| 追问 | 答法要点 |
|---|---|
| 为什么不用一个数据库事务管整轮对话？ | 长连接不能持有事务；短事务 + 乐观版本 + 应用层重放 |
| LLM 输出不可靠怎么办？ | 三层：语法（JSON schema）→ 结构（Pydantic strict）→ 语义（引用必须在原文唯一命中） |
| 怎么防止 prompt 注入？ | 所有用户/模型产生的文本在 system prompt 里被声明为 DATA；评分只认服务端校验过的引用 |
| 为什么用 Upstash 而不是自建 Redis？ | 零运维 + 按量；代价是没有阻塞弹出与强投递保证，已明确标注为未完成项 |
| 单 JSONB 文档会不会成为瓶颈？ | 会。1MB 上限 + 写放大；下一步是按消息表分片，只把控制面留在文档里 |
| 测试覆盖率多少？ | 不报覆盖率，报**契约覆盖**：907 个 API 测试，测试环境强制 inline 模式，永不触达真实外部服务 |
| 这个项目上线了吗？有用户数据吗？ | 没有。所有指标都是合成数据或单次样本，明确不代表教学效果 |
| 你最大的技术债是什么？ | 三个：队列无恢复保证、LLM 评分无校准集、扩展依赖 YouTube 未公开行为 |
| 如果重做会怎么改？ | 会话状态拆表；评分引入人工标注小集做一致性校验；字幕获取改成用户授权文件上传为主路径 |

---

## 6. 主动暴露的短板（准备被问，别等被挖）

1. **没有真实用户与效果验证**。所有"教学有效"的表述都被刻意降级为"投递/评估正确"。
2. **LLM 评分无校准**。0–4 分是主观意见，没有与人工标注的一致性指标（如 Cohen's κ）。
3. **队列不具备生产级恢复**。LPOP + 锁是至少一次语义，进程崩溃可能丢任务。
4. **扩展依赖未公开行为**。YouTube 改版即失效，只能靠多级降级兜底。
5. **运行时状态是单文档**。1MB 上限，长会话会触顶。
6. **提交历史被压缩**（18 个提交、粒度很粗），不能作为"持续迭代"的证据——如果被问，直接说这是整理后的仓库形态。

---

## 7. 话术

### 30 秒版
> 我做了一个英语输出训练产品，核心是把视频里的真实表达变成个人语料，再用 AI 情景对话逼你用出来。技术上有三块是我真正花时间的：一是把流式 LLM 的半截 JSON 变成可渐进展示、最终严格可校验的结构化数据；二是把实时语音会话做成服务端持有、带票据和代际隔离的可恢复资源；三是评分只认服务端能逐字验证的引用，模型不能自己编证据。项目没上线，所以我对所有效果类结论都标了验证边界。

### 3 分钟版（加一段架构 + 一个数字）
> ……（接上面）架构是 pnpm + Turborepo 的 monorepo：Next 15 前端、FastAPI 后端、MV3 扩展。后端严格分层，路由只管协议、服务层管编排、集成层管外部适配。数据侧 Supabase 做持久化并用 RLS 隔离，Upstash 做任务状态，任务状态用一段 Lua 保证"重试只增不减、终态不可回退"。实时语音这块，浏览器拿到的是 30 秒一次性票据，服务端用 Postgres 函数做 CAS，所有状态变更走"读-纯函数-CAS"重放，最多 6 次。延迟上我把一次练习创建的数据库往返从 9 次压到 5 次，规划从"整体重生成"改成"最多修一个字段"，5 目标的真实模型请求 18 秒，其中 4 秒是本地修复。规模上 API 侧 900 多个测试函数，测试环境强制走确定性内存模式，不会打到任何付费服务。

---

## 8. 面试前自检

- [ ] 能在白板上画出三条闭环 + 四个 worker 的位置
- [ ] 能解释 `_JOB_WRITE` 那三行单调性判断在防什么
- [ ] 能说清"票据 / runtime_id / generation / version"四者各防哪类错误
- [ ] 能举一个"模型输出被服务端否掉"的具体例子
- [ ] 能说出至少两个 `null` 而不是 `0` 的场景
- [ ] 能诚实说出三个未验证项，且不显得心虚
- [ ] 数字口径统一：**单次样本 / 合成数据 / 无真实用户**
