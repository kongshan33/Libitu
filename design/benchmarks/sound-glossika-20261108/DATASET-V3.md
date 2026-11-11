# Glossika 原记法微调数据包

2026-11-09。第 3 章 588 句已完成来源整理、字形恢复、音轨关联检查和 CTC 数据导出。**549 句可用于教材监督的训练实验，39 句单列复核。此次没有训练模型。**

本地目录：`.cache/sound-pilot/glossika-sft-v3-20261109/`。

## 标签以 Glossika 为准

采用新的 `glossika-literal-v3`，按用户最新要求覆盖旧 v2 的默认转换：

- 保留 `⁼`、`ṇ`、`ʧ/ʤ/ʦ/ʣ`、`ʴ/ʱ`、元音后的 `ʲ/ʷ`、结合弧和其他附标。
- 用户明确确认 `ṇ` 表示成音节 n，点在 n 正下方。本版本仍输出 `ṇ`，不改写成 `n̩`；教材本来使用的 `n̩` 也保留。
- 第 23 句的 `t͡ʧ` 确实印在原页，书中为结合弧提供了自己的解释。按源记法原样保留，不自动删去或展开其中一个 t。它现在可以进入原记法训练；原 49 句实验不改写。
- 采用 Unicode NFC；不使用 NFKC，不用词典、G2P 或语音模型重写教材 IPA。
- `ipa_book_raw` 保存原提取值；`ipa_book` 保存按 PDF 字体映射恢复的标记；`ipa` 是选定的教材读法；`target` 仅做 NFC 和移除排版空白。原空格不是经过对齐的词边界。
- 前一轮确认过的 50 句保留原切片和确认来源。本包以教材记法重新输出标签，因此字符形式可能与旧审校包中展开过的连字不同。旧人工输入、实验和评测均保留。

此前 180 句中的 199 个替代字符已根据源字体 CID 和原页说明恢复：130 个结合弧、69 个不除阻附标。原 PDF 哈希未改变。恢复记录、用户对 ṇ 的确认和原始字段均随包提供。

## 实际规模与证据

| 项目 | 数量 |
|---|---:|
| 编号短句 | 588 |
| 可训练行 | 549 |
| 其中：已有用户切片/文本核对 | 50 |
| 其中：教材标签 + 自动音频关联检查 | 499 |
| 暂存复核 | 39 |
| 可训练音频总时长 | 490.54625 秒，约 8.18 分钟 |
| 已输出句级候选 WAV | 587 |
| CTC 词表 | 60 个实际字符 + blank / unknown，共 62 项 |
| 验证/测试行 | 0 / 0 |

499 条新增训练行的 IPA 来源是用户提供的专业教材标注；自动 ASR 只检查大致文字及音轨对应关系，没有完成逐音素人工听辨。可用于该监督等级的训练实验，不冒充独立金标。

所有音频为 16 kHz、单声道、PCM16 WAV。逐条保留原音轨哈希、解码 PCM 哈希、起止采样帧、切片哈希、PDF 页码、标签来源与自动检查结果。复用首批 50 句时，逐字节验证其切片等于原轨对应的 PCM 范围。

整轨使用本机固定版 faster-whisper-small.en、faster-whisper 1.2.1、CPU int8、beam 5、无提示词、无上一段文字条件。对于自动关联通过率不足 80% 的三条轨道，进行一次按 8 个语音区间分块的重试；原始结果保留。匹配采用单调动态规划，允许一句跨多个停顿区间；文字不符、替代边界接近或无法定位时进入复核。

这不是新的现象检测器。`events` 设为 null，表示没有提供现象标签，不能解读为未发生。

## 目录与训练接口

| 文件 | 用途 |
|---|---|
| `train.jsonl` | 549 条完整训练记录，包含相对音频路径、IPA、整数标签和来源 |
| `train.reviewed.jsonl` | 50 条已有人工音频/文本核对的子集 |
| `train.book.jsonl` | 499 条新增教材监督子集 |
| `hf-train.jsonl` | Hugging Face JSON 兼容列：audio、text、transcript、label_ids 等 |
| `vocab.json` | 源记法字符到 ID；blank 为 0，unknown 为 1；训练标签没有 unknown |
| `LABEL-CONTRACT.json` | 标签、字符投影、来源和分组规则 |
| `manifest.jsonl` | 全部 588 条，含暂存状态 |
| `review-queue.jsonl` | 39 条原因、候选音频、源页码和关联检查信息 |
| `audio/` | 可训练音频及复核候选；训练器只读取清单中可训练的文件 |
| `alignment.json` / `provenance/` | 音轨关联、原始 ASR、字形修复与构建来源 |
| `ARTIFACTS.sha256.json` | 冻结文件校验清单 |

`hf-train.jsonl` 中 `text` 是 **IPA 训练目标**，`transcript` 才是英文文字。载入 JSON 后应将音频相对路径解析到数据包根目录，再按 16 kHz 音频读取；不能把英文 transcript 当成该 IPA 任务的答案。

项目提供可直接交给 PyTorch DataLoader 的 `GlossikaDataset` 和 `CTCCollator`：

```python
from pathlib import Path
from torch.utils.data import DataLoader
from scripts.sound_pilot.glossika_training_data import GlossikaDataset, CTCCollator
from scripts.sound_pilot.encoder_models import load_encoder

root = Path('.cache/sound-pilot/glossika-sft-v3-20261109')
dataset = GlossikaDataset(root)  # 可改为 subset='train.reviewed'
encoder, extractor, _ = load_encoder('wav2vec2-phoneme')
loader = DataLoader(dataset, batch_size=4, shuffle=True,
                    collate_fn=CTCCollator(extractor))
```

读取器检查冻结文件、路径范围、音频格式和哈希、源记法与标签一致性、split、未知符号，以及相邻重复标签所需的 CTC 帧数。批次提供 input_values、attention_mask、以 -100 补齐的 labels，以及音频/标签长度。

本包使用 **新的 62 类 CTC 输出头**；可以加载四个底座的编码器，不能直接套用旧 399 类输出头或旧冻结评测协议。数据准备不自动解冻编码器，也不执行优化器更新。ZIPA 的旧词表同样不能未经适配直接使用这些标签。

## 复核与后续范围

39 条的原因有交叉，不能直接把下列数字相加：23 条文字关联分歧，19 条候选边界歧义，3 条多读法（110/120/130），5 条可选 `(v)`（235–239），1 条印刷错误示例（459）。第 541 条没有可靠句级定位，因此没有伪造切片；可从原音轨和相邻条目复核。

整个 Glossika 集合仅作为训练来源；短句同族、重复文本和未核实说话人不能随机拆成所谓独立测试。现有 8773 独立样本听辨包与草稿保持原样，549 句导出不依赖它填写完毕。后续质量评估仍使用单独冻结的开发/测试资料。

本次处理范围是第 3 章 588 句。第 2 章单词和第 4–10 章专项音轨已有来源清点，但尚未整理成逐条监督训练数据；不计入本包的可训练时长。

## 复现

在项目根目录执行，输出目录须不存在：

```sh
PYTHONPATH=apps/api apps/api/.venv/bin/python -m scripts.sound_pilot.glossika_corpus prepare
PYTHONPATH=apps/api apps/api/.venv/bin/python -m scripts.sound_pilot.glossika_corpus fallback
PYTHONPATH=apps/api apps/api/.venv/bin/python -m scripts.sound_pilot.glossika_corpus build --out /tmp/glossika-literal-reproduction
PYTHONPATH=apps/api .cache/sound-pilot/venv/bin/python -m scripts.sound_pilot.glossika_training_data validate
PYTHONPATH=apps/api .cache/sound-pilot/venv/bin/python -m scripts.sound_pilot.glossika_training_data preflight
```

新导出是源记法适配版本，不覆盖首批审校、v1/v2、49 句已训练模型或四编码器既有评测缓存。

## 验收

549 条训练数据逐文件哈希、PCM 格式、词表往返和 CTC 长度全部通过。6 条真实音频覆盖 `ṇ`、`⁼`、不除阻附标、结合弧和 `ʱ`；Wav2Vec2Phoneme、WavLM Base+、WavLM Large、HuBERT Large 均完成真实编码、损失计算和新头反向传播。梯度有限且非零，编码器无梯度，参数未更新。新头参数量分别为 63,550 / 47,678 / 63,550 / 63,550；这些是格式兼容检查，不是模型准确率。

新增 25 项回归测试覆盖源符号保留、损坏/可选标记拒绝、标题隔离、句内停顿合并、缺句/重复句歧义、冻结输入篡改、路径越界、held/test 行拒绝和 CTC 重复标签预算。预检证据见 [CTC 检查](SFT-DATA-V3-PREFLIGHT.json)，数据统计见 [汇总](SFT-DATA-V3-SUMMARY.json)。

根目录 `pnpm lint`、`pnpm build`、`pnpm test` 均通过：API 2,150 项通过；未改动的 Web/Extension 使用有效缓存。本轮没有网页改动，因此没有新增桌面或手机端视觉验收声明。
