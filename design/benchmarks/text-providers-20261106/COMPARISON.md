# Stage 1 / Mission / Stage 5：DeepSeek 与 Doubao 对比

后续说明：本文保留最初切换时的历史结果。匹配与结构修复后的实现、30×3 回归及本轮 Doubao 欠费限制见 [后续质量报告](../text-quality-20261106/COMPARISON.md)。

2026-11-06。本地文本链路已切换到 `deepseek-flash`，并重启开发服务和 workers。当前抽样中 DeepSeek 更快，但质量有取舍：提取更顺利，教学分析出现可复现的目标匹配退步，最终评估两家都不够稳定。

## 范围与方法

- Doubao：Ark 官方地址、`doubao-seed-2-1-lite-260915`。DeepSeek：官方地址、`deepseek-flash`。均复用本地已有服务端凭据，不记录凭据或请求头。
- 两轮，每轮对两家运行六个自编案例：Stage 1 短篇会议文本、三目标单场景规划、正常使用/仅提及短语的教学分析，以及对应的六轮对话最终评估。第二轮反转两家的先后顺序。
- 实际执行应用的提取、规划、教学分析和评估函数，包含原有重试、校验、证据修复和降级。每个案例在两家及两轮的首次请求 messages SHA-256 一致，没有改提示词来偏向某一方。
- 24 个逻辑任务，共 **26 次真实 HTTP 请求**：Doubao 的两次 Stage 1 都因输出字段类型不符而各重试一次。其他任务均一次请求，没有追加模型修复。
- 两家都关闭 thinking，保留任务原有 temperature、token 和超时预算。DeepSeek 官方支持该关闭方式及 JSON 模式；模型别名可能更新。[thinking 文档](https://api-docs.deepseek.com/guides/thinking_mode/)、[JSON 文档](https://api-docs.deepseek.com/guides/json_mode/)。
- 数据为脚本内固定的合成输入，不读取或写入真实学习记录；没有测试麦克风、语音服务或数据库持久化。帮助请求共享已测试的文本 transport，本轮没有单独评审帮助内容。

## 速度

单位：秒；为从实际应用函数调用到返回的墙钟时间，包含校验、重试及降级。表中列出两轮均值，不是 p50/p95。

| 任务 | 每家样本数 | Doubao | DeepSeek | 样本耗时下降 |
| --- | ---: | ---: | ---: | ---: |
| Stage 1 完成（含自动重试） | 2 | 40.40 | 14.26 | 65% |
| Mission 规划 | 2 | 6.23 | 3.81 | 39% |
| 教学分析（正常使用 + 仅提及） | 4 | 3.10 | 1.25 | 59% |
| Stage 5 返回（含 partial） | 4 | 17.91 | 5.96 | 67% |

Stage 1 首个有用预览是 2.30 / 2.16 秒（Doubao）与 1.81 / 1.50 秒（DeepSeek）；这不是首字时间。完成耗时的差距包含 Doubao 的重试成本，不能解释为纯生成速度差距。

Stage 5 的平均值包括不完整结果，不能把更早的 partial 当成完整报告提速。两家各只有一份完整报告：同一正常使用输入第二轮分别为 17.87 / 6.58 秒。完整结果的样本量只有各一份。

这是开发机上的应用体验抽样，包含服务线路、排队、缓存、输出长度和本机并行检查影响；没有隔离网络或运行环境，也不推断普遍速度、成本或学习效果。

## 输出质量

**Stage 1：DeepSeek 在这些样本中更稳定。** 两轮一次通过，分别提取 12 / 14 条；Doubao 首次输出分别在 `logic_flow.4.title`、`logic_flow.0.subtitle` 上不满足字符串契约，第二次才通过，得到 11 / 7 条。两家摘要均保留小规模试点、支持能力限制和两周复盘等主要事实。人工抽查中 DeepSeek 更常给出短而可复用的表达；Doubao 第一轮多个 chunk 是整句。条目更多不等于更准确：DeepSeek 仍有过于依赖场景的长片段及改写后的结构模板，未做独立专家全量标注。

**Mission 规划：两家四次均一次通过。** 都保留三个目标及占位框架，给出合理的试点沟通场景。DeepSeek 的提问较具体，但部分框架把“trade-off”简化为单一坏处，表达收益与代价的平衡不如 Doubao 第一轮明确。没有证据表明规划质量全面领先。

**教学分析：DeepSeek 有明确退步。** 对正常句中的目标 `One trade-off is`，两轮都引用 `One trade-off is that` 并标为 `variant`。原有严格校验以 `variant_target_not_grounded` 拒绝该候选，最终只保留 `uncertain` 的词面观察；Doubao 两次都正确确认了两个目标。没有放宽校验来让 DeepSeek 通过。

另一方面，对 `I didn't use 'to be fair'. I was only reading the phrase on the card.`，DeepSeek 两次都判为不合适的交际使用；Doubao 一次不提供语义确认、保留 uncertain，一次判为 inappropriate。两家均未把这个反例奖励为恰当使用。

**Stage 5：两家各 1/4 ready，3/4 partial。** 正常使用案例第一轮，Doubao 缺少 task-fit 的充分覆盖；DeepSeek 该轮没有产出可确认的分数，其他维度显示未评估。第二轮两家都形成完整报告，三个目标均确认。仅提及短语的反例两轮均 partial：未确认的使用不会计为掌握，DeepSeek 两次对两个短语都保留 uncertain。保守拒绝保护了结果，但也说明完整性和分类稳定性仍需改进。

## 实现、验证与复查

`TEXT_ANALYSIS_PROVIDER=deepseek|ark` 统一选择 Stage 1、Mission 规划/教学/帮助和 Stage 5 的 key、URL、model。默认及本地配置为 `deepseek` / `deepseek-flash`；Corpus 独立开关也默认 DeepSeek。`ARK_*` 原有预算仍用于两个 provider。缺少所选 key 时明确失败，不自动借用另一家的 key。保留历史 `ark_*` 模块路径以控制迁移范围。

OpenAI Realtime 和 TTS 使用自己的配置。新请求采用所选 provider；既有蓝图、规划、语料分析和报告不会批量重生成。`TEXT_ANALYSIS_PROVIDER=ark` 可显式切回，修改后须重启 API、blueprint worker、feedback worker。Corpus 需要单独设置其 provider。

- 根目录 `pnpm lint`、`pnpm build`、`pnpm test` 全通过：1,913 API、522 Web、124 extension tests。
- 两家 endpoint/model/credential、JSON/SSE、缺少 DeepSeek key 不跨 provider 回退、语音/Corpus 配置隔离均有离线覆盖。测试环境清空两家 key，避免意外付费调用。
- 开发进程组已重启；`/health/ready` 返回 `worker=ready`、`model=deepseek-flash`。这是本地运行验证，没有生产部署。
- 未为获得更好结论修改教学/评估提示词。当前优先待解决的是 exact/variant 分类与评估维度/证据完整性。

复查材料：[Mission/Stage 5 请求与应用输出](results.json)、[Stage 1 请求、输出与重试诊断](stage1-results.json)、[运行状态](runtime.json)。运行脚本为 `apps/api/scripts/compare_text_providers.py`；从 `apps/api` 使用 `.venv/bin/python -m scripts.compare_text_providers --live --output /absolute/path/results.json`，会真实付费调用两家 API。

记录限制：初版脚本将部分压缩 HTTP 字节当成文本，故删除了无法解码的 wire body；完整的已解析应用输出、教学 raw_content、请求和耗时均保留，Ark 可读 SSE 另保留合并后的原始内容与初次失败。运行脚本已修复压缩解码，但未为补日志额外请求模型。初版 Stage 1 fixture 使用了无效的 `ContentKind=text`，四条在 HTTP 前失败的记录保留在 `results.json`，不计入 provider 统计；修正为 `pasted_text` 后的四次逻辑任务在 `stage1-results.json` 中。
