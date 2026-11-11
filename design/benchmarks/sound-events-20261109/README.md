# 闪音四底座对照与同化／融合清点 v1

本轮接受专业语料已有标注，不要求用户再听辨。比较四个**具体检查点**在同一局部事件任务上的可读出信息；不沿用 IPA 排名，也不把该实验称作线上检测器验收。

## 数据与口径

- 主数据为 Buckeye、TIMIT 的公开研究副本 `nh0znoisung/buckeye` / `nh0znoisung/timit`。固定 revision、每个 Parquet 的上游 LFS SHA-256、实际文件哈希及源记录坐标。它们不是本机原有文件，也不是直接取得的完整官方原始发行包。
- TIMIT 保留 61 音值，不做会合并 `dx` 的 39 音素简化。保留官方 TRAIN/TEST 身份，TRAIN 内按方言分层、说话者隔离划出约 20% 验证；排除全员重复的 SA 句。其余重复句仍可能跨说话者，另报未见词的诊断结果。
- Buckeye 副本重复记录去重；按说话者 70/15/15 划分，不接受副本自带的 train/test 划分。副本时间戳经 `round(seconds × 16)` 量化，边界误差约 ±31.25ms，零长区间仍可能包含真实闪音。用上游原格式样例核对转换；不得用于精确闭塞或闪音时长测量。
- 使用项目固定 CMUdict 提供底层读音。只有完整词序列能保守对应实际音值、并且目标位明确为 /t,d/ 的 `dx` 才作为闪音正例；对应位置实际保留 `t/d` 为负例。喉塞、缺失、无法对应、未知标记均不补成负例。源音码与派生事件分开保存。
- 第一轮只选词典上下文为元音／r 后、元音前的共同候选环境；每语料最多 800 训练、300 验证、300 测试。稳定哈希排序、说话者轮转选样，验证／测试不按结果平衡类别。这是候选子集抽样分布，不是整个语料的自然发生率。
- 同化只清点底层 /n/ 与实际 [n/m/ŋ] 及相符后接触发条件；融合只清点跨词 /t,d/+j 在完整两词序列中能明确对应的融合／保留序列。它们是专业音值支持的保守派生标签，不是新做的独立现象人工金标。其余归入 unknown；数量不等于语料中全部现象数量。

## 固定实验

模型复用 `encoder_models.py` 的版本和权重哈希：Wav2Vec2Phoneme、WavLM Base+、WavLM Large、HuBERT Large。

- 编码器冻结，CPU FP32，2 threads。相同固定 1 秒音频窗口；目标中心由专业源边界定位。不能声称具备端到端定位能力。
- 每模型取 0/25/50/75/100% 深度五层，在固定相对位置做三个 160ms 均值池化，不把标注音段长度直接喂给分类器。音频模型实际接收上下文，仍需后续预测边界实验。
- 同结构线性 sigmoid 头。Base+ 输入维度较小，头参数量不同；不把结果解释成架构控制实验。所有特征只用训练集统计量标准化。
- 每层 3 个固定种子、400 次 AdamW 更新、batch 64、learning rate .001、weight decay .01。每 40 步记录验证 AP；每种子选择验证 AP 最好的轮次，再按 3 种子平均验证 AP 选层，阈值由验证 F1 确定。所有模型预算相同。
- 对照：只音频、音频＋词典上下文、只文字／词典上下文。上下文词表仅从训练集构建，不读取实际源音值作为输入。
- 四模型和文字对照全部封存选择后，才提取和预测测试音频；保存 `TEST-RELEASE.json` 及所有选择／头文件哈希，之后拒绝训练。分别报告两语料的逐类指标与按说话者重采样的区间；保留所有种子与逐条概率。
- 首轮不解冻编码器、不改原 IPA 头、不训练同化／融合、不接入产品 Sound 证据。

## 执行

仅离线研究虚拟环境需要额外 `pyarrow==19.0.1`、`scikit-learn==1.6.1` 和测试工具；不增加在线 API 的 ML 依赖。

```sh
PYTHONPATH=apps/api .cache/sound-pilot/venv/bin/python -m scripts.sound_pilot.event_sources
PYTHONPATH=apps/api .cache/sound-pilot/venv/bin/python -m scripts.sound_pilot.event_corpus
PYTHONPATH=apps/api .cache/sound-pilot/venv/bin/python -m scripts.sound_pilot.event_source_audit
PYTHONPATH=apps/api .cache/sound-pilot/venv/bin/python -m scripts.sound_pilot.event_probe run
PYTHONPATH=apps/api .cache/sound-pilot/venv/bin/python -m pytest --noconftest apps/api/tests/test_event_corpus.py -q
```

工作目录 `.cache/sound-pilot/events-v1-20261109/`：源文件及锁、全部记录与派生清单、重复记录、说话者划分、固定抽样 manifest、源核验、clips、features、heads、封存文件及结果。数据导出不覆盖已有 manifest；特征和训练可按相同协议恢复。下载和原模型文件不进入 Git。

源文档：[Buckeye](https://buckeyecorpus.osu.edu/corpusinfo)、[TIMIT](https://catalog.ldc.upenn.edu/LDC93S1)、[Buckeye 研究副本](https://huggingface.co/datasets/nh0znoisung/buckeye)、[TIMIT 研究副本](https://huggingface.co/datasets/nh0znoisung/timit)。

本次已确认的源缺陷：`buckeye:s1901b` 的标签末端超出音频约 30.45 秒，整条隔离。全新工作目录运行时，源核验会先生成 `source-quarantine.json` 并阻止使用该录音；将初次 manifest 归档为 `quarantine-input-manifest.json`，重新执行 preparation 和 audit 后才启动 probe。已交付的固定 manifest 已完成这一步，不需要再改标签或重新听辨。

当前完整任务正在后台运行，`RUN-STATUS.json` 记录阶段或错误；`event_probe run` 在成功结束时自动写出 `RESULTS.json` 并重建 `REPORT.md`。中断后按相同协议恢复；一旦生成测试 release，训练保持锁定。

运行方式：受管理的长任务终端会话；当前会话号保存在 `worker-registration.json`。不安装登录自启动任务。关闭／终止该任务会中断运行，已有校验后的特征与检查点可继续复用。
