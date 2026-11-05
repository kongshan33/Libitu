# DeepSeek Flash 与 Doubao Lite 对照 · 2026-11-05

本地 Corpus detail 的 Explain、Syntax 和追问已切换到 DeepSeek 官方 API 的 `deepseek-flash`。两轮共 12 个真实 API 请求全部成功；这些样本的响应明显更快，两次整句改写均保留了“有困难”的程度。仍有局部句法术语、翻译和模板约束问题，不能据此认定教学质量已全面通过。

## 比较条件

沿用 [前一轮报告](README.md) 的短语 `pockets of greatness`、包含它的完整转折句、相同前后文与两道追问。三个 system prompt 的 SHA-256 均与 Doubao 最后完整轮次相同；没有为 DeepSeek 修改提示词。Syntax 的 kind 使用当轮 Explain 的输出，整句均走完整分析分支。

两者均关闭 thinking、请求 temperature=0.1；Explain 上限 4000 tokens，Syntax / 追问上限 3000 tokens。Doubao 通过 Ark，DeepSeek 通过官方 API，所以这是应用实际体验的对照，包含线路、服务排队、缓存和输出长度差异，不是隔离服务商影响的模型速度基准。

官方当前将 `deepseek-flash` 指向 DeepSeek-V4.1-Flash-1017，模型别名可能继续更新；本次按实际请求别名记录。[DeepSeek 官方调用文档](https://api-docs.deepseek.com/quick_start)

## 耗时

| 输入 | 链路 | Doubao 最后检查 | DeepSeek 第 1 轮 | DeepSeek 第 2 轮 |
| --- | --- | --- | --- | --- |
| 短语 | Explain | 9.553 s | 3.036 s | 3.134 s |
| 短语 | Syntax | 7.587 s | 1.926 s | 1.873 s |
| 短语 | 追问首字 / 完成 | 4.763 / 7.451 s | 0.332 / 1.268 s | 0.915 / 1.976 s |
| 整句 | Explain | 12.571 s | 3.347 s | 4.187 s |
| 整句 | Syntax | 10.179 s | 2.492 s | 2.865 s |
| 整句 | 追问首字 / 完成 | 4.628 / 6.631 s | 0.680 / 1.481 s | 0.780 / 1.533 s |

时间为本地 API 墙钟时间，首字指首条非空文本 SSE delta。各条件只有很少样本，不报告 p50/p95 或通用提速比例。未记录完整计费用量，不判断实际成本。

## 输出质量

两个 DeepSeek 整句追问均给出：

> The team does some great work in design, but it still has trouble delivering consistently.

它保留第三人称主体、转折和困难程度，解释与实际改动对应。相比 Doubao 末轮把 `struggles to` 加强为 `can't`，这一项在两次对照中表现更好。两次短语追问都按要求给出 A/B 两轮各一句，比较分散区域与孤岛的意象，没有宣称固定的正式度高低。

Explain 的 teacher note 两轮都符合 60–120 字符要求，例句和用法框架较简洁。短语框架均保留 `[team] has pockets of greatness in [area]`。Syntax 两轮都正确识别名词短语 / 并列句、范围限定和不定式补足成分。

逐项审读仍发现：

- 第一轮整句 grammar_points 把整个 `of greatness` 称为“介词宾语”；准确说法是 `greatness` 作 `of` 的宾语。第二轮没有再出现这句，但不能视作已经消除。
- 两轮整句意译均用了“偶有亮点”，把空间/范围上的“局部”偏移到时间上的“偶尔”；其他说明及直译仍使用“局部/零散”。
- 第二轮整句框架给出四个 slot，超出提示词中三个的篇幅目标；例句也换用了 `pockets of excellence`，学习目标保持不够稳定。
- 短语内部结构仍有重复，发音建议未经真实音频核对。

没有为了获得更好结论继续改提示词或丢弃这两轮中的不理想输出。建议当前保留 DeepSeek 做后续体验；语义、术语与泛化稳定性仍需更广材料验收。

## 配置与验证

新增 `CORPUS_ANALYSIS_PROVIDER=ark|deepseek`，只用于 Corpus detail 三条链路。仓库默认仍为 `ark`，当前本地 `.env` 已设置为 `deepseek`，使用已有 `DEEPSEEK_API_KEY`，目标 `https://api.deepseek.com` 和 `CORPUS_DEEPSEEK_MODEL=deepseek-flash`。API 已重新加载配置。未修改其他文本任务或语音模型，没有向语料库写测试记录，也没有批量重生成旧分析；旧卡片可通过 Refresh explanation 获取新结果。

53 个相关 API 测试通过，新增覆盖两种 provider 的三条链路：地址、模型、凭据、JSON / SSE 模式，以及缺少 DeepSeek key 时不得暗中退回 Ark。`git diff --check` 通过。本轮无前端改动。

第一轮原有离线检查为 22/22，第二轮为 21/22：字符串规则拒绝了 `pockets of real greatness`，因为它不包含连续的 `pockets of greatness`。这是合法地加入形容词的搭配；保留原始失败记录，不能把严格子串检查等同于语义错误，也不把结构检查当作质量验收。

完整请求、返回内容、耗时及检查记录见 [deepseek-comparison.json](deepseek-comparison.json)。现有 [run-live.py](run-live.py) 现在读取实际 Corpus provider/model，可按新 round 名重跑；每轮会发起六个真实请求。
