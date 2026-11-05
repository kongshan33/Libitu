# Corpus detail 真实豆包检查 · 2026-11-05

后续已完成 [DeepSeek Flash 对照并切换本地 Corpus provider](DEEPSEEK_COMPARISON.md)。以下保留此前 Doubao 检查记录及其当时结论。

已完成短语和整句的 Explain、Syntax、追问实测，并修正字段重复、搭配归属、类型标签和虚构易错点。**传输与结构检查通过；Lite 的教学内容仍未通过稳定性验收，尤其是追问改写的语义保持。** 不把某一轮生成得好当作这些问题已经消失。

## 输入与方法

- 短语：`pockets of greatness`。
- 整句：`The team has pockets of greatness in design, but it still struggles to deliver consistently.`
- 前句：`We need to take an honest look at how the team is performing.`
- 后句：`Our next step is to make those strengths part of our everyday process.`
- 短语追问：和 `islands of excellence` 比较语气，再给两句职场对话。
- 整句追问：改成日常口语，保留先肯定再指出问题的语气，并解释改动。

以上是自拟的测试语境，不是真实视频引文。通过本地运行的 API 调用 `ark.cn-beijing.volces.com`，默认模型为 `doubao-seed-2-1-lite-260915`，没有使用模型输出 mock。未写入用户语料库或数据库。

共有六轮完整 API 检查，每轮六个请求；最后另验证一次短语类型归一化。另有六个直连 adapter 的思考模式对照请求，以及两个未成功的 Pro 请求。未采集 API 内部重试次数。所有原始内容与耗时保存在 [evidence.json](evidence.json)；其中 `final`、`accepted` 等是执行时的历史目录名，**不是质量验收结论**。直连 adapter 的两组追问未记录独立起始时间，不沿用输入 fixture 的时间戳。

耗时是调用端从发起本地 API 请求到完整响应的墙钟时间；追问首字指第一条非空 SSE 文本 delta，不是模型首 token 或浏览器绘制时间。最新完整轮次六个请求均为 HTTP 200，Explain 均为 `analysis_source=ai`，追问均有 `delta` 和显式 `done`。

## 实测耗时

| 输入 | 链路 | 首轮 | 最后检查 |
| --- | --- | --- | --- |
| 短语 | Explain | 16.44 s | 9.55 s |
| 短语 | Syntax | 9.28 s | 7.59 s（类型防护后的补测） |
| 短语 | 追问首字 / 完成 | 2.84 / 5.00 s | 4.76 / 7.45 s |
| 整句 | Explain | 15.95 s | 12.57 s |
| 整句 | Syntax | 13.61 s | 10.18 s |
| 整句 | 追问首字 / 完成 | 4.99 / 7.28 s | 4.63 / 6.63 s |

Explain、Syntax 的这些样本比首轮快，追问没有一致提速。它们是小样本单次观测，不是 p50/p95，也不能区分提示词缩短、服务排队和缓存的影响。没有完整账单或 token 采集，不推断成本降幅。

## 已落实的修复

1. **减少重复与生成量。** Explain 默认一个例句、一个最小用法框架，搭配保留目标表达；近义项描述替换对象及差异。输入框占位文案由应用提供，废弃的 `pragmatic_function` 不再生成。完整选择的边界说明由已验证边界生成，避免在隐藏文案中再次产生错误句型分析。
2. **明确句法字段职责。** 短语只保留内部结构、句中角色、局部逻辑；应用清空重复的 `grammar_points` 和无关模块。短语类型只留简短标签，括号里的第二套分析不再混入。完整句提示词区分限定分句、不定式补足成分、领域限定和名词中心词。
3. **去掉虚构的易错项。** 一轮生成了“pocket 必须是复数，不能用单数”的错误禁令。新 Explain 没有学习者错误例句，应用固定返回空 `pitfalls`；具体易错点留给结合例句的追问。保留字段兼容旧记录，没有批量改写已保存的分析。
4. **收紧发音与追问。** 发音只建议弱读/重音，不臆测原音频连读。追问限制对话句数、改写解释一致性、主语与语义程度保持，并避免无依据的语体排名。这些语义要求仍是模型约束，不能等同确定性校验。

当前短语的可复用框架能输出 `[team] has pockets of greatness in [area]`，搭配能输出 `have pockets of greatness` 和 `pockets of greatness in [area]`。后续完整句 Syntax 样本正确给出并列句、`in design` 的领域限定及 `to deliver consistently` 的补足作用。

词性核对参考 [Cambridge 的 pocket 词条](https://dictionary.cambridge.org/dictionary/english/pocket)；`struggle to do` 的动词模式参考 [Oxford 的 struggle 词条](https://www.oxfordlearnersdictionaries.com/us/definition/english/struggle_1)。这些是本次审读依据，没有实现在线词典检索或自动事实验证。

## 仍未通过的内容质量

- **改写语义保持仍会失败。** 最新快速模式整句追问把 `struggles to` 改成 `can't deliver that level consistently`，并声称意思相同。此前也出现过输出仍用 `has`，说明却声称改成 `have`。提示词修正降低了部分问题，但重复检查仍有复发，不能宣布稳定修好。
- **语体、语法和篇幅约束并非全部可靠。** 语体比较仍可能夹带“更日常”等主观排序；Syntax 的 Style 偶尔重复使用场景；重音拼写、近义项粒度也有波动。类型标签防护不能证明整段句法分析正确。
- **等级只是估计。** 同一材料出现 B2/C1 变化，未做 CEFR 标注校准。没有真实音频，IPA 和重音属于学习读法建议。

对照 `thinking=enabled`：`minimal` 的 Syntax 用时 14.17 s，仍产生错误的 compound-complex 标签；`low` 的 Syntax 用时 27.42 s。最新 `low` 追问首字分别为 23.15 s、31.68 s，整句还擅自把 `The team / it` 改成 `Our team / we` 并假定说话人属于团队。因此保留快速模式，未把明显变慢的对照配置上线。可用参数根据 [Ark 模型参数文档](https://docs.volcengine.com/docs/ark/model-parameter-support?lang=en) 核对。

尝试的 `doubao-seed-2-1-pro-260915` 两个请求返回 HTTP 404，未获得可评价答案，未切换生产配置；仅凭 404 不断言具体权限或开通原因。

后续质量验收应覆盖更多独立材料、重复生成和改写语义检查，或在可成功调用的更强模型上对照。当前结果足以确认实际调用和响应时间，不能证明教学内容已稳定可用。

## 代码验证与重跑

46 个相关 API 测试通过，覆盖兼容字段、已验证边界、短语模式、失败状态及 SSE 完成条件；`git diff --check` 通过。[22 项离线结构检查](contract-checks.json) 通过，但它们不评价语义准确性。本轮未改前端，不重复此前的前端构建与浏览器检查。

完整的最终 system prompts 保存在 [Explain](prompts/corpus_selection_system.txt)、[Syntax](prompts/corpus_syntax_system.txt)、[追问](prompts/corpus_followup_system.txt)。追问请求还在 user 消息尾部附有语义保持提醒，见 `apps/api/app/integrations/ark_corpus_detail.py`。

启动加载当前代码的本地 API 后，从仓库根目录手动运行以下命令；它会使用当前 Corpus provider 配置发起六个真实模型请求，结果写入 `output/corpus-live/<round>/`：

```sh
apps/api/.venv/bin/python design/benchmarks/corpus-detail-20261105/run-live.py new-round
```
