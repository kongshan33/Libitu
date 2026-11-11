# Glossika 首批数据准备与审校

2026-11-08。已完成自动整理和第一批审校工具，没有训练模型，也没有人工确认的 Glossika 标签。

打开本机审校页：<http://127.0.0.1:8769/>。用户资料位于 `.cache/sound-pilot/glossika-dataset-v1/`，完整教材内容和衍生音频不进入 Git。统计见 [BATCH-ONE-SUMMARY.json](BATCH-ONE-SUMMARY.json)。

## 处理结果

| 项目 | 本轮结果 |
|---|---|
| 短句来源索引 | 588 条，保留编号、PDF 页码、源文件 SHA-256 |
| 规范化候选 | 588 条；117 条展开旧式塞擦连字，原始字符串保留 |
| 修复/审定队列 | 467 条，含 180 条乱码、特殊记法和多个教材形式；各问题可能重叠 |
| 重复文本 | 3 组：173/439、213/447、259/425；不将这些分到不同评测集合 |
| 首批音频 | 第 127 轨的 1–50 句，50 个 16 kHz mono PCM WAV 候选，共 47.756 秒（含余量） |
| 完整音轨与教材页 | 保留完整解码音轨；提供 PDF 第 71、72 页图像核对 |
| 首批现象候选 | 5 个保守的 `/t,d/ + you/your` 文本语境；不是 5 个已发生事件 |
| 人工确认 IPA / 事件 | 0 / 0 |
| 可训练行 / 独立测试金标 | 0 / 0 |

第 127 轨首先读了 “English Common Sentences 1–50”。使用独立 faster-whisper small.en 识别发现标题，并在切分中排除标题候选，避免编号整体错位。实际切分参数是 `silencedetect=-35dB, d=0.25s`，每句前后各保留约 100ms；生成的是需要听辨确认的边界。ASR 未输入教材提示，也没有被用来生成 IPA 标签。模型、参数、模型文件哈希和输出哈希记录在 pack 中。

片段使用解码后 16 kHz PCM 帧索引，50/50 已验证与完整轨道的对应 PCM 区间逐字节一致。这个检查证明音频没有错切到其他文件或在导出中改变，并不证明候选边界已经符合人的听辨。ASR 词时间也不精确，部分首词落在候选之外；页面明确显示这只是核对线索。

原始教材形式、规范化候选、人工 `ipa_heard` 分字段保存。仅使用 NFC 和显式旧式塞擦连字展开，不使用 NFKC，不删除附标。`⁼/ˀ/ʴ/ṇ/ɫ` 等保留并进入审定队列；第 459 条印出的错误读法单列；第 10/110/120/130 条多形式不自动选为听辨答案。

## 如何核对

1. 填一个审校者昵称。播放候选切片，需要时听前后上下文或完整轨道。
2. 核对是否为该句、开头结尾是否完整。可以调整音轨秒数；确认后填入实际文字。
3. 将教材形式填入 IPA 草稿，按录音修订，再选「已核对实际读法」。听不确定可以保留为待复核；无需手动标每个音素的时间。
4. 本轮可以跳过语音现象。可选记录支持全部 12 个类别；第一轮建模范围仍为词内闪音、融合、鼻音部位同化。正/负事件需要目标词位、局部时间和适用子类；空项不会变成阴性。

句级 IPA 和局部现象是两个工作层。首批 50 句用于检查整个数据流程，不代表三类覆盖充分：其中的跨词 [ɾ] 不能充作词内闪音样本；词内闪音组、can/to 专项和其余短句切分仍待处理。

## 保存、身份和划分

- 浏览器按包哈希保存草稿；约 650ms 后同步本机。磁盘路径为 `reviews/latest.json`，每次变化另留不可覆盖的 `draft-<time>-<hash>.json`。可直接从磁盘取回，无需依赖浏览器下载。
- 「导出全部草稿」允许未完成记录，并始终生成可复制的完整 JSON。导入前检查包、源文本/音频/切片绑定、状态和字段；旧草稿留在版本历史。页面只说明生成了下载，不假称用户已经保存文件。
- 本机服务仅监听 `127.0.0.1`，写入需要同源 Origin、Host 和会话 token；备份目录在静态站点目录之外。启动时验证资料包、切片和完整音轨身份。
- 暂把整个 Glossika 集合作为同一来源组，`split=null`、用途为开发/适配。没有核定说话人、句族和近重复前，不做随机 80/10/10 切分。既有听辨和四模型对照样本也属于已看过的开发诊断材料。
- 即使单人审校完成，工具仍不会输出可直接训练的 manifest；先冻结 IPA 词表、标签粒度与分组，之后单独构建训练输入。训练监督可使用审核合格的单人标签；独立测试另行采集和复核。

## 文件与复现

源码：

- `apps/api/scripts/sound_pilot/glossika_prepare.py`：源身份校验、规范化队列、候选切分、哈希与页面资产生成。
- `glossika_review.py`：只在本机运行的备份服务器、导入结构与证据门槛校验。
- `glossika_review.html` / `glossika_review.js`：独立审校工具，不修改正式 Sound 页。
- `apps/api/tests/test_glossika_dataset.py`：边界/乱码/身份/未知状态/局部事件/备份版本/同源校验。

本地数据目录提供 `sentences.candidates.jsonl`、`ipa-review-queue.jsonl`、`event-candidates.jsonl`、`clips.candidates.jsonl`、`split-policy.json`、`QUALITY.json`、原始 ASR 输出、切分日志、`site/pack.json` 和音频/教材页。

从仓库根目录重新运行独立 ASR（需要已安装的 faster-whisper 1.2.1 和现有本地 small.en 模型）：

```sh
PYTHONPATH=apps/api apps/api/.venv/bin/python \
  apps/api/app/services/acoustics/transcribe.py \
  --model .cache/acoustic-phase1/models/faster-whisper-small.en \
  --audio 'design/seed/Glossika 你不知道的英文發音/Ch.3-常用英文短句發音訓練/PRON-EN-127-CS001-050.mp3' \
  > .cache/sound-pilot/glossika-assessment-20261108/first-track-asr.json
```

构建需要已有的 588 条来源索引、原 PDF/音频、ffmpeg，以及含 pypdf/pdfplumber 的 Python。本机使用：

```sh
/Users/river/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 \
  apps/api/scripts/sound_pilot/glossika_prepare.py

PYTHONPATH=apps/api apps/api/.venv/bin/python \
  -m scripts.sound_pilot.glossika_review \
  --root .cache/sound-pilot/glossika-dataset-v1 --port 8769
```

不要在有人填写时替换来源包；数据内容变化会生成不同哈希，旧草稿不能直接套用。纯 HTML/JS 样式修订不改变 pack 身份。

## 验证

- 新增数据/备份测试 14 项通过；最后补充完整音轨身份检查后再次通过。
- 根目录 `pnpm lint`、`pnpm build`、`pnpm test` 通过；API 2,053 项，Web 540 / Extension 124 使用已有有效缓存。API 的一条 Starlette 弃用警告不是失败。
- 浏览器实际播放 50/50 个 WAV，全部有有效时长和播放时间推进；当前边界播放能够自动停止。
- 1400×1000 桌面与 390×844 手机视口检查通过；后者为浏览器视口模拟，不是实体手机验收。页面展开原页/现象编辑后也没有横向溢出。
- 填写、下一句/第 50 句导航、键盘操作、自动磁盘备份、刷新恢复、清空浏览器存储后的磁盘恢复、下载 JSON、正确包导入、错误包拒绝均通过。
- UI 测试使用独立 `qa/` 目录和端口 8770，标为 `QA fixture only`；用户端 8769 的 reviews 没有测试标签。
- 截图：`output/playwright/glossika-desktop-top.png`、`glossika-mobile-top.png`、`glossika-mobile-review.png`。测试日志在数据目录的 `lint.log/build.log/test.log`。

下一步是审校首批、补齐另两类及匹配反例、冻结标签与评测，再执行 [计划](PLAN.md) 中的 Wav2Vec2Phoneme / WavLM / ZIPA large 三项实验。本轮没有准确率、微调收益或线上检测完成的结论。
