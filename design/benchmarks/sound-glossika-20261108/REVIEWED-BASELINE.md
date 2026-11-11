# 首批审校入库、三模型基线与 CTC 预检查

2026-11-08。用户完成首批 50 句，并授权继续。完成了审校快照归档、录音/文字/IPA 对应校验、训练候选分流、150 次真实推理及 CTC 工程预检查。没有训练后的模型或泛化准确率。

## 人工记录与数据输入

最初读到 46/50 条完整记录。用户明确确认第 2、4、11 句的未勾状态和第 8 句的空白文字均可补齐；随后读取的本机新快照已包含全部 50 条确认。因此直接归档新快照，没有修改或替换原始标注。

- 原始确认快照：`.cache/sound-pilot/glossika-reviewed-v1/review-original-9eea1c427b2c.json`。
- SHA-256：`9eea1c427b2c1b7f0edc46aa60fd4829ec3c669fc6976e53ae88a89fb559c915`。
- 50/50 条通过包、音轨、切片、文字与审校身份校验。切片总计 **47.755875 秒**；所有边界与已确认候选一致。
- 教材原始 IPA、用户确认 IPA、模型输出分别保存，用户没有修改教材候选字符串。这是带教材提示的单人确认，不是独立盲标。
- 41 条生成实验用 CTC 输入候选；9 条进入记法待审定队列：**23、26、30、33、34、39、40、45、46**。这不是让用户重新听全部 50 句。

第 23 条的原书 `t͡ʧ` 被机械展开为 `t͡t͡ʃ`，其复合含义不能靠字符串替换决定；其余待审定项含 `⁼`、`ʴ` 等特殊记法。保留原始读法和用户确认，暂不把这些字符串作为标准化训练答案。用户的听辨确认不自动解决编码/记法语义。

后续状态：已根据官方 IPA / Unicode 与教材定义完成 [v2 记法适配](IPA-INVENTORY.md)，解除其中 8 条限制，得到 49 条新候选，词表候选为 399 项。本文保留原 v1 的 41 条指标范围和 397 项预检记录；不追改基线分数。

另收到 **15 条现象观察：9 闪音、5 融合、1 弱化，全部为 present**。这些记录均没有完整局部时间；第 1 条事件起点 `0.004` 也不在该句音轨区间内。七条闪音明确跨多个词，其余两条范围待定，不能并入第一轮「词内闪音」实验。所有原值保留；局部事件训练行仍为 0，没有从未填项目生成阴性。

## 同一批真实录音的模型输出

三种模型均只输入音频，没有输入句子或教材 IPA。每种 50 条，共 150 条输出；原始 token、ZIPA CTC 数组、音频/文字/manifest/模型 SHA-256 全部保留。

| 模型 | 完成推理 | 41 条可比记录的 IPA 字符差异率 | 50 句输出中的 `ɾ` 数量 |
|---|---:|---:|---:|
| Wav2Vec2Phoneme | 50/50 | 39.85% | 17 |
| ZIPA small CRCTC 500k | 50/50 | 51.58% | 0 |
| ZIPA large CRCTC 500k | 50/50 | 48.79% | 0 |

**表中的百分比不是发音识别准确率，也不是 PER。** 采用固定的 Unicode 字符编辑距离：NFC、展开旧式塞擦连字、去除空格/词边界标识/结合弧，保留其余细节；只对 41 条无上述记法待定项的记录汇总，参考字符数为 537。教材 `d̪` 与模型 `ð`、教材元音后的 `ʲ/ʷ` 与另一套双元音记法等差异都会计入，不能把 `1−差异率` 称为正确率，也不能通过删除细节制造更好的分数。

用户确认的 50 句 IPA 共含 23 个 `ɾ`。模型列为整个音串中的数量，尚未在人工时间窗中逐一匹配，不能当作 17/23 的闪音召回率。也没有把短句中的跨词闪音算作词内事件。

两个例子说明保留哪个基线有意义：

- “What does it do”：参考含 `ɾ`，Wav2Vec2 输出 `wʌɾʌzɪtduː`；两种 ZIPA 均输出 `wʌtɪzɪtdu`。
- “What did you do”：参考包含 `d͡ʒ`；Wav2Vec2 输出中有 `dʒ`，两种 ZIPA 此处仍分开输出 `d/j`。这里只展示输出差别，未据此计算融合检测的逐类准确率。

在这批开发材料上，Wav2Vec2 仍是更值得进入 IPA 适配实验的候选。ZIPA large 略降低了该字面差异，但没有解决这批样本的 `ɾ` 输出缺失。以上结论仅限这 50 个同源、同模板短句；不代表其他说话人、学习者或自然语流表现。

ZIPA large 使用官方列出的 CR-large 500k **FP32** 导出，而非无附标版或量化版。[官方模型列表](https://github.com/lingjzhu/zipa#pretrained-models) / [模型仓库](https://huggingface.co/anyspeech/zipa-large-crctc-500k)。固定 revision：`62c7a6e31f5035045de2538448a46b037948a206`；ONNX SHA-256：`1ea7ea3d0fd85863f5121cd1b729fbb4c41cb804431e780776c48caba3fecdd3`。与 small 使用同一已校验 tokens.txt。

## CTC 输入与词表检查

对 Wav2Vec2 现有词表做精确分词检查发现：50 条中有 **46 条无法原样表达全部审校细节**。这表示缺少适当标签编码，不等于这些音频全部识别错误；也不能静默用 `<unk>` 或 G2P 改写答案。

为 41 条候选生成最小扩展方案：

- 保留原有 **392 个** token、ID 和所有已有输出层权重。
- 暂增 **5 个**独立符号：`ɦ`、`ʱ`、`ʷ`、`ː`、`̪`，词表共 397 项。有些记号原词表只在复合 token 中出现，因此仍需独立项表达本批标签。
- 标签用动态规划精确分词，优先已有 token，禁止未知替代；所有目标序列与编码器时间轴兼容。
- 冻结编码器，仅为新增输出行初始化权重。选取覆盖新增符号和片段长短的 5 条数据，验证 CTC loss 有限、输出头梯度有限且非零、编码器没有梯度、原输出行未被修改。
- **优化器步数 0；未保存训练模型。** 这些检查证明代码和输入能接上训练，不证明学习效果。

`inventory.candidate.json` 的 27 项表只是初始「出现过哪些字符」诊断，不能替换模型的完整词表。实际 A 实验候选使用 `wav2vec2-vocab-extension.json` 与 `wav2vec2-training-candidate.jsonl`，保留原模型的发音覆盖。最终音段/附标口径、扩展方案及验证集仍需冻结后才做质量实验。

## 产物、验证与复现

完整本地目录：`.cache/sound-pilot/glossika-reviewed-v1/`。

- `review-confirmed.json` / `review-validation.json` / `source-pack.json`：原始确认及绑定。
- `reviewed-records.jsonl` / `audio/`：50 条实际确认数据。
- `notation-holds.jsonl` / `event-observations.jsonl`：待审定记法与原始现象观察。
- `inference-manifest.json` / `baselines/`：三个冻结原模型的真实输出。
- `baseline-rows.jsonl` / `BASELINE-ROWS.md`：全部 50 句逐模型明细，留在本机。
- `BASELINE.json` / `CTC-PREFLIGHT.json`：诊断结果与反向传播检查。
- `split-lock.json`：整组用途为 development；validation/test 均为空，不能用候选训练行充作独立测试。

新增脚本：`apps/api/scripts/sound_pilot/glossika_accept.py`、`glossika_baseline_report.py`、`glossika_ctc_preflight.py`。原 `run.py` 增加 ZIPA large 的固定模型身份；`compare_extra.py` 增加自定义 manifest/audio-root 与 Wav2Vec2 权重校验，保留原第二轮默认路径。

```sh
# 接收新的确认快照时使用新的输出目录；现有 intake 不允许覆盖。
PYTHONPATH=apps/api apps/api/.venv/bin/python -m scripts.sound_pilot.glossika_accept \
  --pack-root .cache/sound-pilot/glossika-dataset-v1 \
  --review .cache/sound-pilot/glossika-reviewed-v1/review-original-9eea1c427b2c.json \
  --out .cache/sound-pilot/glossika-reviewed-v2

# 既有 v1 的报告可以从冻结的输出重新生成。
PYTHONPATH=apps/api apps/api/.venv/bin/python -m scripts.sound_pilot.glossika_baseline_report \
  --root .cache/sound-pilot/glossika-reviewed-v1

PYTHONPATH=apps/api .cache/sound-pilot/venv/bin/python -m scripts.sound_pilot.glossika_ctc_preflight \
  --root .cache/sound-pilot/glossika-reviewed-v1
```

验证：数据/报告/CTC 单元测试合计 30 项通过，包括拒绝错音频、错文字、漏项/重复结果、未完成模型运行和不可表示标签。50 个新 WAV 经过精确帧裁剪与哈希绑定；150 个输出均完成校验；5 条真实样本通过 CTC 反向检查。根目录 `pnpm lint`、`pnpm build`、`pnpm test` 全部通过，API 2,069 项；Web 540 / Extension 124 使用有效缓存。最后结果在本地 `lint.log/build.log/test.log`。本轮未修改正式产品 UI，也未重新声称实体手机验收。

下一阶段：先完成记法映射和最终监督粒度，补独立说话人的验证材料，再做 Wav2Vec2 IPA 监督微调；WavLM 现象实验需要词内闪音与鼻音同化的新目标、局部窗口和同语境未发生/竞争实现样本。本轮不从这 15 个阳性观察直接拟合三分类器。
