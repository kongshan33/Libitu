# Corpus detail：9.16 改进与真实输出对比

2026-11-06。保持当前 DeepSeek `deepseek-flash`，不更换文本或语音供应商。

## 最终实现

- 保留用户确认的 **16px 区块间距、Use it 在 Meaning 前**。Reader detail、Add to corpus、Library 共用内容组件。
- Explain schema v3 增加 `learning_text`、`explanation.meaning_summary`、`ask_suggestions`；Syntax 增加 `section_summaries`，短语补充翻译。新增字段在 API、浏览器存储和账户保存之间双向保留；旧记录通过主动 Refresh explanation 升级。
- 原句 `selected_text` / `recommended_text` 不改写。短语词条还原语境词形；完整句子保持原文。学习标题、IPA、重音和 TTS 对应学习词条。固定表达必要词形保留，用户自定义名称和保存的结构模板保留。
- 追问建议选择填入输入框、再次点击取消、点击发送才请求；成功保存后原位置显示 Saved to note。答案继续受限 Markdown 流式展示。
- 弹窗最大 92dvh；原生关闭后再卸载，让浏览器恢复焦点；蒙层关闭支持 `closedby` 与特性检测的指针回退，拖动文字到外部不会误关。Add to corpus 保留非模态 Pin 行为。补齐来源标题、H3 层级、Syntax 按需生成说明和整句分析提示。
- Pitfalls 无学习者错误证据时仍为空；使用场景只在 Explain 出现一次。

设计文档中的两个 prompt 已同步为实际运行时字段契约，不直接采用会丢失字段的嵌套草案。用户提供的原始草案保存在 `output/corpus-prompt-review-20261106/prompts/proposed-*.txt`，本轮原始生产 prompt 在 `output/corpus-prompt-improved-20261106/release/prompts/before-*.txt`。

## 测试方法

最终一轮：4 个合成上下文 × Explain / Syntax × 修改前后 × 2 轮，共 32 次真实提供方请求；并发 2，轮次交换先后顺序，temperature 0.1、thinking disabled，Explain 上限 4000 tokens、Syntax 3000。4 例为 pockets of greatness、drifted away from、包含 pockets 的完整句、包含 analyst / hopes / struggles 的完整句。

这些是回归样本，部分错误已写入提示词用于修复，不能当作盲测。另用未参与调参的 broke the ice、glimmers of hope、Her proposal has several advantages… 做了 6 次真实 Explain / Syntax 调用，加 2 次真实流式追问；最后对 glimmers 和 drifted 做 2 次本地 HTTP 到实际提供方的完整路径验证。所有材料是合成文本，没有写入真实用户语料。

## 响应速度

下表是最终 32 次请求的提供方 HTTP 完整响应时间，包含请求网络开销，不含浏览器绘制、TTS 或本地后处理。均值与 token 均包含产生多余括号的响应，不剔除失败样本。

| 调用 | 原 prompt 平均 / 中位 | 新 prompt 平均 / 中位 | 平均输出 tokens（前 → 后） |
| --- | --- | --- | --- |
| Explain（各 8 次） | 3.684s / 3.700s | 4.102s / 4.270s | 511.75 → 619.75 |
| Syntax（各 8 次） | 2.335s / 2.360s | 2.712s / 2.654s | 269.50 → 375.38 |

新增内容分别增加约 **0.42s / 0.38s**；这次改进提高内容完整性和一致性，没有带来提速。只有打开 Syntax 才产生第二次调用。

追问保持原有 prompt：短语两句职场对话首字 **0.758s**、完整 **1.382s**；整句口语改写首字 **0.774s**、完整 **1.410s**。两次均收到显式完成事件。对话正好两句；改写用 has a hard time explaining，保留“有困难”，没有改为“不能”。

完整本地 HTTP 验收：glimmers **5.054s**、drifted **3.526s**。本地词典首次加载存在额外开销；离线回放首次后处理约 0.96s，后续使用进程缓存。这些是小样本观测，不是 SLA 或生产延迟承诺。

## 质量变化与发现的问题

| 检查点 | 修改前最终对照 | 修改后最终结果 |
| --- | --- | --- |
| drifted 词形一致性 | IPA 用 drift，标题、重音和音频文本仍为 drifted（2/2） | 学习词条 / IPA / 重音 / audio_text 均为 drift；原句仍为 drifted（2/2） |
| pocket 词条 | 没有独立学习词条字段 | pocket of greatness，单数 IPA 与重音一致（2/2） |
| analyst 重音 | 一次写成 aNALyst | 两次均 AN-a-lyst |
| pockets 的范围 | 两次意译写成“偶有亮点”，把范围换成频率 | 两次保留“局部 / 一些亮点” |
| has 的词性 / 时态 | 调参中曾误判现在完成时 | 最终两次都识别实义动词一般现在时；新 proposal 句也正确 |
| 短语 Syntax | 三块分析，无翻译 | 三块 + 翻译 + 整句提示；没有膨胀成七块 |
| 新字段和模板 | 没有学习词条、摘要、追问建议、模块摘要 | 8/8 Explain 字段可读，8/8 模板 slot 键与占位符一致，均有 3 条追问建议 |
| 来源 / 保存 | 原文证据已有 | 保持原文；规范化文本另存并用于学习，云端与本地 round-trip 通过 |

真实输出还暴露了几类问题，不能只靠 prompt 假定模型全部遵守：

1. **多余 JSON 结束括号**：最终新 Explain 原始 JSON 6/8 严格有效，另 2 条在完整对象之后多一个 `}`。增加极窄解析恢复，只接受“一个完整有效对象 + 一个多余右花括号”，仍拒绝正文、第二个对象和截断 JSON，并继续 Pydantic 校验。最终 16 条新 Explain / Syntax 捕获输出经实际校验全部可用；原始错误仍保留在日志中。
2. **无依据语体比较、原句重复、反义项**：提供方偶尔仍给“更正式”或原样片段，甚至明确标为相反含义的表达。服务层保守省略这些候选，不自动改写为另一个解释；因此 Similar expressions 可以少于两条或整个隐藏。
3. **困难被翻译成不能做到**：当原文只说 struggles / difficulty 等且没有明确不能做到，省略包含“无法 / 不能 / 说不清”等绝对化说法的译文，保留其余译文。最终回放删掉 1 条此类意译；不为凑齐两条补写答案。
4. **未见复数样本 IPA**：glimmers 还原为 glimmer 后，模型曾保留 /z/。复用已有固定版本 CMUdict，在单词一一对齐、词典证明为稳定词干加规则屈折后缀时移除多余 IPA 后缀。原样词条、已有正确 IPA、不规则变化、未知词、词边界不同和有歧义的词干不做自动修正。最终真实 HTTP 输出为 `/ˈɡlɪmər əv hoʊp/`，朗读文本也是 glimmer of hope。

## 验证范围

- `pnpm lint`、`pnpm build`、`pnpm test`：通过；API 1905、Web 514、Extension 124 项测试通过。此前新测试曾因 fixture 未使用字段 alias 失败，已修正后全量重跑。
- 浏览器：1440px / 390px、guest / account fixture、普通 / reduced motion；验证惰性 Syntax、失败重试、真实浏览器音频生命周期（合成 WAV）、建议选择/取消/发送、安全 Markdown、笔记/分析保存并刷新恢复、规范化标题/来源原文、蒙层/Esc/按钮关闭和焦点返回、`closedby` 缺失回退、拖动边界、反复键盘切换、Add to corpus 样式/来源标题/Pin/字段编辑/保存。
- 浏览器使用隔离合成 fixture，不代表真实账户写入或生产 TTS 音质验收。本轮没有重新生成付费语音，也未改变既有 OpenAI 语音模型。
- 模型的词性术语、比喻直译、近义区别和去重仍不是形式化可证明的正确性；规则只处理已定义的窄问题，不保证任意新句子无误。例如新 idiom 的字面译仍较生硬，完整句部分模块仍有重复。结论是这些回归案例的改进，不能外推为全面教学质量通过。

## 可复查产物

- 最终请求、原始响应、用量、耗时和 prompt SHA-256：`output/corpus-prompt-improved-20261106/release/results.json`
- 最终应用解析/规范化结果：`output/corpus-prompt-improved-20261106/release/app-results.json`
- 最终统计：`output/corpus-prompt-improved-20261106/release/metrics.json`
- 未见样本与追问：`output/corpus-prompt-improved-20261106/heldout-and-followup.json`
- 本地 HTTP 验收：`output/corpus-prompt-improved-20261106/http-acceptance.json`
- 调参失败输出完整保留在同目录、`final/`、`accepted/`；没有用最终输出覆盖旧结果。
- 浏览器截图：`output/playwright/corpus-detail-v3-*.png`、`corpus-syntax-v3-*.png`、`corpus-pronunciation-v3-*.png`、`add-to-corpus-v3-*.png`。
