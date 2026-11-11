# Speech Accent Archive 下载与 Glossika 兼容性审计

日期：2026-11-09。结论：**值得作为窄式 IPA 的补充训练语料，但原样不能接入现有 Glossika 训练；本轮没有证明其逐音素准确率，也没有训练模型。**

用户后续明确接受 SAA 的专业转写作为训练监督，不再进行重复听辨确认。按此执行：剩余工作是具体字符清洗、标签契约、音频配对与训练格式处理；独立听辨不再作为训练前置条件。下文“未独立听辨”仅说明本次审计的证据范围。

实际完成了固定版本下载、全量音频解码与标签扫描、官网转写回查、21 条抽样音频身份核验、无提示 ASR 内容检查和实际编码器兼容性检查。助手本轮无法直接听辨音频，因而没有独立声学裁决；不能把下面的源码一致性、字符覆盖率或 ASR 结果称作窄式 IPA 准确率。

## 下载范围与来源

- 下载的是 [changelinglab/speechaccentarchive-pr 固定快照](https://huggingface.co/datasets/changelinglab/speechaccentarchive-pr/tree/00a47d76d3a4f476cd6275fc10dc34f7ca635f6b)，revision `00a47d76d3a4f476cd6275fc10dc34f7ca635f6b`，共 1,242 条音频及对应 IPA。
- 完整下载该版本的 7 个 Parquet 分片及元文件，共 3,064,685,852 字节，约 3.06 GB。每个分片的 SHA256 与上游 LFS 哈希一致，见 [下载锁](DOWNLOAD-LOCK.json)。这是该研究快照的全量，不是仍在增长的官网全部录音。
- [本地数据目录](/Users/river/Documents/Libitu/.cache/sound-pilot/speech-accent-archive-20261109)：原分片在 `source/data`，原始标签在 `labels.jsonl`，来源页面在 `source/official-samples`，21 条试听 WAV 在 `samples`。
- [固定数据卡](https://huggingface.co/datasets/changelinglab/speechaccentarchive-pr/blob/00a47d76d3a4f476cd6275fc10dc34f7ca635f6b/README.md)标为 **CC BY-NC-SA 2.0**；[官网当前下载页](https://accent.gmu.edu/download/)标为 **CC BY-NC-SA 4.0**，另提供 OSF 下载。保留各自版本的来源与许可，不替旧快照重新标许可证；两者均含 NC 限制，不能据此认定 Libitu 已获得商业训练或商业部署授权。

全量实测音频为 **35,504.09 秒 / 9.862 小时**，单条 15.77–77.74 秒。1,242 条均可解码，未发现文件字节或带采样率/声道信息的解码 PCM 完全重复。1,239 条单声道、3 条双声道；采样率以 44.1 kHz 为主，另有 22.05/32/48 kHz。简单能量/满幅筛查未触发设定阈值，但这不证明无噪声、无截断或转写正确。原音频未转换；试听副本统一为 16 kHz 单声道 PCM16。

## 窄式标注能提供什么

[官方方法说明](https://accent.gmu.edu/howto/)称转写由 2–4 名受过语音学训练的英语使用者完成，集中于音段，不处理重音或声调；词间空格用于阅读，不是时间标注。本地数据确实包含大量细节符号，因此具有训练窄式音段识别的价值。

下列是 **NFD 后标签中的符号出现次数**，不是已听辨确认的声学事件数量，也不是带时间戳的训练事件：

| 标注 | 出现次数 | 涉及录音 |
|---|---:|---:|
| 送气 `ʰ` | 3,926 | 1,001 |
| 鼻化 `̃` | 13,248 | 1,217 |
| 清化 `̥` | 6,558 | 1,183 |
| 齿化 `̪` | 4,620 | 1,077 |
| 闪音 `ɾ` | 763 | 480 |
| 喉塞音 `ʔ` | 460 | 279 |
| 未释放 `̚` | 1,057 | 462 |
| 成音节 `̩` | 391 | 280 |
| 软腭化 `ˠ` | 1,367 | 557 |
| 嘎裂声 `̰` | 79 | 47 |
| 气声 `̤` | 3 | 2 |
| 边音释放 `ˡ` | 2 | 2 |

另有 `˺` U+02FA 共 1,101 次、468 条录音。它的 Unicode 名称属于声调符号，但在这些转写中出现在塞音后的旧式未释放记法位置；这与官网“不标声调”的说明相符。这里只提出来源相关的映射候选，没有把它自动改为 `̚`。上表未把两者合并。

## 抽查发现

抽样方案固定为 ID 哈希排序前 12 条、English 前缀的 6 条，以及细节标注/格式异常补充，共 21 条。另对疑似字符问题及一个旧式记法样本扩大文字来源回查，共请求 69 个官网页面。

| 检查 | 结果 | 能支持的结论 |
|---|---|---|
| 官网 IPA 对照 | 67 条成功取得，67 条均在 NFC、去空格及转写括号后与 HF 标签一致 | 整理版忠实保留了这些官网转写；不是声学正确性验证 |
| 未取得的页面 | `sa'a1`、`tokpisin1` | 网络/页面获取失败，保留未核实状态 |
| 抽样音频对照 | 21/21 与官网 MP3 的对齐波形相关性 0.991998–0.999891，零时移，较短信号完整重叠 | 抽样音频确为对应官网录音 |
| 本地无提示 ASR | 21 条均完成；20 条相对固定 69 词段落的编辑数为 0–9，`igbo1` 为 22 | 可用于查找读错、重复或 ASR 失误线索；不能归因于 IPA 标错 |
| 独立逐音素听辨 | 0 条 | 本轮不报告 IPA 正确率或细节标注准确率 |

ASR 使用本地 `faster-whisper-small.en`，CPU int8、beam=5、temperature=0、无 initial prompt、无前段文本条件。词比较统一小写、去标点，并将 0–12 的数字写法转为英语单词，避免把 `6`/`six` 之类的显示差异算成漏词。完整输出、设置与模型权重哈希留在缓存。词编辑数比较的是朗读段落和 ASR 文本，不是人工文字金标，故没有称为识别准确率。

字符审计发现 **50 条需要记法复核的记录**，见 [复核队列](NOTATION-REVIEW-QUEUE.json)。这是启发式候选集，不表示 50 条都错，也不表示其余 1,192 条已清洗合格。代表问题如下：

| 例子 | 观察 | 处理判断 |
|---|---|---|
| `kiswahili4` | 一个私用区字符 `U+F1C8` | 按来源字体与字形证据恢复；若暂时无法确定，仅暂存这条技术异常 |
| `greek6` 等 | 西里尔 `ӕ`；另有 `ә、а、і` | 视觉像 IPA/拉丁字符，但编码不同；需来源限定的字形修复 |
| `tamil2` | 积分号 `∫`，同时有西里尔字母 | 疑似旧字体/转写编码问题，不能直接当成新音素 |
| `yoruba2` | 罗马数字字符 `ⅼ` | 疑似同形字混入 |
| `igbo1` | 大写 `I`，ASR 也有较多段落差异 | 字形与朗读内容分别复核，不能直接改成 `ɪ` |
| 多条 | `ǝ`、`đ`、ASCII `:` | 可能是旧记法；列为映射候选，不自动判为声学错误 |

成功回查的疑似字符也存在于官网原文，不能把问题全部归因于 HF 转换。保留所有原标签；本轮没有静默替换符号。

可直接打开 [21 条抽查样本包](/Users/river/Documents/Libitu/.cache/sound-pilot/speech-accent-archive-20261109/REVIEW.md)，其中包含音频、官网链接、保留空格的官网 IPA、ASR 线索和待复核项。`ACOUSTIC-REVIEW.template.json` 提供绑定音频/标签哈希的空白人工记录模板；所有人工结论为空。

## 对 Glossika 词表的实际覆盖

比较基准为 [v4 contract](../sound-glossika-20261108/vocab-v4/CONTRACT.json) 和 [117 项 custom vocab](../sound-glossika-20261108/vocab-v4/custom.vocab.json)，遵守当前规则：**NFC、仅去空白和 `[]/`，不应用音值替换**。

按原始词表的 79 个来源条目检查，在 SAA 中找到 66 个，缺 13 个。此处检查的是符号或其 Unicode 规范等价序列，不是所有“基本音 + 修饰符”组合。

| 来源分组 | 有标注 / 条目数 | 没有出现的原写法 |
|---|---:|---|
| 主元音 | 12 / 12 | — |
| 辅音 | 33 / 37 | `ɟ、ʦ、ʣ、ɫ` |
| 对照元音 | 4 / 4 | — |
| wh 方言音 | 1 / 1 | — |
| 来源附加符号 | 2 / 4 | `̼、̍` |
| 成音节来源写法 | 0 / 2 | `ṇ、ṃ` |
| 既有短句补充符号 | 14 / 19 | `ʱ、ʴ、̊、⁼、ⁿ` |

缺写法不等于缺声音：SAA 中有 `lˠ` 1,356 次/553 条，有连续子串 `n̩` 115 次/105 条、`m̩` 24 次/22 条。它们可能对应 Glossika 的某些写法，但当前 contract 不允许擅自合并。`n̩` 等子串数不包含被其他附加符号隔开的序列。`ts/dz` 子串存在也不能直接证明覆盖 `ʦ/ʣ` 塞擦音，因为它们可能是辅音序列。

编码方向反过来看，SAA 的规范化标签共有 **330,904 个字符、172 种 NFC 字符**。现有 custom vocab 认识其中 318,115 个字符，字符出现次数覆盖率 **96.135%**，但仍有 **101 种未收录字符**。未知字符不全是垃圾，例如 `r、ɜ、x、β、ʈ、ʁ` 可能是真实音值，不能为了适配词表删除或替换；尤其不能把 `r` 一概改为 `ɹ`。

调用现有 `ipa_adapt.encode` 对每条实际转写编码，得到：

| 词表 | 大小 | 完整可编码录音 / 1,242 |
|---|---:|---:|
| Glossika custom v4 | 117 | **13（1.05%）** |
| Glossika adapted v4 候选 | 481 | **69（5.56%）** |
| 原始预训练 Wav2Vec2Phoneme | 392 | 0 |
| 已训练的 IPA adaptation v1 | 416 | 7 |

这些是**完整目标字符串可表示性**，不是模型识别能力或质量排名。一个未收录字符就会使整条失败。481 项是 v4 候选词表，不能与实际训练过的 416 项头混称。即使把词表和标签都拆成 NFD，仍有 84 种未覆盖码点；单做 Unicode 分解解决不了兼容问题。

## 训练可用性判断

**适合的用途**：清洗后作为真实人声、不同说话人和口音的窄式音段监督补充，尤其增加送气、清化、齿化、鼻化、闪音及未释放标注。它比目前 490.55 秒的 Glossika 短句集合更长，但是否改善外部识别效果仍需实验。

需要在数据准备阶段解决以下事项：

1. 保留原转写与来源，审核 50 条字符队列，建立来源限定、可追溯的 SAA 兼容规则；确实不同的合法音值应扩展词表或使用独立输出头。不要用删除未知字符的办法制造“可训练”目标，也不要改写已冻结的 Glossika 标签与头。
2. 直接采用来源专业转写作为训练监督，不要求用户再听辨确认。旧式符号、乱码和缺失字形按来源文档与编码证据修复；无法解决的具体记录单独保留，不让少数异常阻塞其余数据。21 条样本包是可选审计材料。
3. 以整段音频和整段 IPA 做 CTC 在数据结构上可行，原快照没有词/音素时间戳，且仅 15 条原转写保留空白。不能直接当成现有 Sound 局部事件标签；裁句需要额外对齐与检查，不能按字符比例切割。
4. 所有人朗读同一篇段落，按说话人划分只能检验同文本的新说话人表现。训练前需登记说话人/来源、保留未参与清洗决策的验证集，并使用不同文本的独立 IPA 数据评价泛化；本轮接触过的 21 条不再作为盲测集。
5. `english` 前缀有 185 条，仅表示来源 ID 的母语提示。抽到的 English 说话人包含美国不同地区和加拿大，不能整体当作 GA 标准读音。真实音素识别与目标 GA 示范数据应保持区分。
6. 缺少标记不能视为相应声音不存在。对 `ⁿ、⁼、ʴ` 等 Glossika 写法及极少的气声/边音释放标注，SAA 不能提供充分监督；它无法单独补齐词表。

**建议顺序**：先做来源字符清洗和音频配对检查，再冻结兼容词表及外部评测，最后开展单独的 SAA 补充实验；不等待用户重复听辨。现在直接混入全部 1,242 条继续训练，会遇到大量目标编码失败，也无法解释新数据是否修复了先前的外部退化。商业用途还须另外解决 NC 许可。

## 复现与验证

本轮新增三个离线脚本，不改变在线 Sound 行为或已有训练数据：

- `apps/api/scripts/sound_pilot/saa_download.py`：固定 revision、断点下载、SHA256 校验。
- `apps/api/scripts/sound_pilot/saa_audit.py`：全量标签/音频审计、实际编码检查、样本选择及结果打包。
- `apps/api/scripts/sound_pilot/saa_sample_check.py`：官网文字回查、音频身份对照、本地 ASR 内容线索。

从仓库根目录运行：

```bash
PYTHONPATH=apps/api python3 -m scripts.sound_pilot.saa_download
PYTHONPATH=.cache/sound-pilot/saa-tools:apps/api .cache/sound-pilot/venv/bin/python -m scripts.sound_pilot.saa_audit labels
PYTHONPATH=.cache/sound-pilot/saa-tools:apps/api .cache/sound-pilot/venv/bin/python -m scripts.sound_pilot.saa_audit audio
PYTHONPATH=apps/api .cache/sound-pilot/venv/bin/python -m scripts.sound_pilot.saa_audit compatibility
PYTHONPATH=apps/api python3 -m scripts.sound_pilot.saa_sample_check official
PYTHONPATH=apps/api .cache/sound-pilot/venv/bin/python -m scripts.sound_pilot.saa_sample_check identity
PYTHONPATH=apps/api apps/api/.venv/bin/python -m scripts.sound_pilot.saa_sample_check asr
PYTHONPATH=apps/api python3 -m scripts.sound_pilot.saa_audit package
```

Parquet 检查使用独立目录中的 `pyarrow==19.0.1`；音频检查使用已有 pilot 环境的 NumPy、SoundFile、SciPy 和 ffmpeg。ASR 复用 API 环境及本地模型，不调用付费 API。原始/已训练词表兼容检查需要现有模型缓存与 adaptation v1 CONFIG。

[机器摘要](AUDIT-SUMMARY.json)、[79 项逐项覆盖](SOURCE-COVERAGE.json)、[全字符清单](CHARACTERS.json)、[序列覆盖](SEQUENCE-COVERAGE.json)及[一致性验证](VALIDATION.json)保存在此目录。验证核对了行数/ID 集、字符计数、21 条样本音频哈希，以及词表/contract 在审计期间未改变。下载锁和标签扫描分别校验过全部分片。没有优化器更新、准确率验收或模型上线。
