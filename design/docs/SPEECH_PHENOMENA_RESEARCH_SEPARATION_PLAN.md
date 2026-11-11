# Speech Phenomena：研究独立管理与服务接入方案

日期：2026-11-11。状态：**提案，尚未迁移目录、启动新训练或接入业务服务**。

本方案依据当前代码、冻结实验和用户给出的 `speech-phenomena/` 目录设计。它为新的语音现象研究规定边界，不改写历史 IPA 实验或已经完成的模型结果。研究无需先完成窄式 IPA 输出头；IPA 保留为独立任务。

## 1. 当前事实与决策

- `apps/api/scripts/sound_pilot/` 有 52 个 Python 文件；`apps/api/tests/` 有 21 个测试文件引用这个研究包。
- 当前 `apps/api/app/` 未发现对 `sound_pilot` 的直接引用。研究反向依赖业务代码：`prepare.py` 调用 `sound_service.annotate_sentence`；`glossika_corpus.py` 调用业务 ASR 的 `recognize/model_fingerprint`；事件构建/协议校验读取 API 内 CMUdict。
- PyTorch 等研究依赖已有独立 requirements 和 `.cache/sound-pilot/venv`，没有加入 API 主依赖。但目录、测试发现、词典和根路径仍耦合；Intel macOS override 也不能代表其他训练平台。
- 大量研究脚本和测试尚未 Git 跟踪，工作区同时存在业务改动。迁移前必须独立盘点和保全，不能用“还原工作区”清理它们。
- 关键数据、模型、听辨结果和实验目前位于 `.cache/sound-pilot`。这些不是全部可重建缓存，应建立持久存储和备份。
- `PROJECT.MD` 等活文档的补测段落仍有 pending 文案；实际补测已完成。迁移执行时同步纠正，保留历史过程记录。

**决定建议：一个独立研究仓库、一个外置数据/产物根目录；稳定后由研究仓库构建独立推理服务，Libitu 仅维护客户端和业务编排。** 暂不再拆第三个模型服务仓库，避免过早增加版本协调成本。

建议路径：

- `/Users/river/Documents/speech-phenomena/`：独立 Git 仓库、Python 包、环境、测试和 CI，不加入 Libitu 的 pnpm/Turbo 工作区。
- `/Users/river/Documents/speech-phenomena-store/`：数据、模型、运行产物、MLflow 存储；以后可以迁到独立磁盘或对象存储。
- `/Users/river/Documents/Libitu/`：产品、业务 API、账号权限、任务、持久化和展示规则。

## 2. 模型选择的依据与边界

同一 1,600/600/600 train/dev/test、三个随机种子的纯音频闪音 F1：

| 底座 | Buckeye | TIMIT | 后续角色 |
|---|---:|---:|---|
| WavLM Large | 88.59% | 94.66% | 首要研究候选 |
| 原始 Wav2Vec2 Large | 88.15% | 93.26% | 必保留对照，非 Phoneme checkpoint |
| Whisper Small encoder | 87.76% | 94.80% | 保留冻结基线，后续按泛化/成本决定复测 |
| WavLM Base+ | 87.21% | 93.56% | 资源与延迟候选，实际成本仍须测量 |
| HuBERT Large | 84.63% | 93.03% | 冻结历史基线 |
| data2vec Audio Large | 82.85% | 94.55% | 冻结历史基线 |

WavLM Large 与原始 Wav2Vec2 的配对说话者 bootstrap 区间在两语料上均跨零，不宣称显著胜出。Whisper 是经过 ASR/翻译监督的 Small 编码器，这不是等参数、等预训练数据的纯架构实验。

当前任务是**人工源边界附近，特定词典环境中的闪音 vs 保留 /t,d/**。裁剪中心来自源标注时间；模型还没有完成自动定位，也没有覆盖喉塞替代等全部负类。现有测试已曝光，留作 regression-v1，不能重新随机划分后称为新盲测。

## 3. 仓库结构

```text
speech-phenomena/
├── AGENTS.md / README.md
├── pyproject.toml                 # 包定义、CLI、依赖分组
├── uv.lock                        # 经验证的平台依赖；不复制旧 venv
├── environments/                  # 历史环境快照、macOS/CUDA 约束与说明
├── configs/
│   ├── labels.yaml                # 类别、子类、标签来源、unknown 规则
│   ├── datasets/                  # 源版本与构建参数
│   ├── models/                    # 六底座 ID、revision、权重哈希、预处理
│   ├── experiments/               # E0/E1/E2/E3 固定配置
│   └── release-gates.yaml         # 上线前冻结的指标与能力范围
├── data/
│   ├── registry/                  # 小型来源锁、manifest、审计、版本索引
│   ├── raw/                       # 外置存储逻辑入口，忽略 Git
│   ├── processed/                 # 按 dataset-version 分目录
│   ├── annotations/               # 原始标签、修订、派生规则分别版本化
│   └── splits/<dataset-version>/  # train/dev/test ID、组别、哈希、划分策略
├── src/speech_phenomena/
│   ├── cli.py / paths.py
│   ├── datasets/                  # Buckeye/TIMIT/Glossika/SAA 适配与审计
│   ├── audio_features.py
│   ├── alignment.py               # 自动定位接口、来源与不确定性
│   ├── models/
│   │   ├── encoder.py             # 统一接口，保留模型特有预处理
│   │   ├── classifier.py
│   │   └── fusion.py              # 仅 audio+context 实验使用
│   ├── tasks/events/              # 当前主线：局部现象分类
│   ├── tasks/ipa/                 # 历史 IPA 研究独立保存，不成为前置依赖
│   ├── train.py / evaluate.py
│   ├── inference.py               # 纯推理，不导入训练/MLflow/Libitu
│   ├── tracking.py / artifacts.py
│   └── review/                    # 听辨/比较页面和本地研究工具
├── experiments/
│   ├── E0_frozen_probe/           # 协议、配置、运行索引；不放大权重
│   ├── E1_mlp/
│   ├── E2_partial_ft/
│   └── E3_lora/
├── contracts/v1/                  # 候选/证据 JSON Schema 与合成样例
├── tests/                         # 单元、数据、复现、契约与集成测试
├── reports/                       # baseline/error_analysis/final_comparison
├── migrations/                    # 路径映射、旧实验来源、校验清单
├── archive/                       # 历史源码与环境记录，不再开发
└── serving/                       # 能力过门槛后实现，独立镜像与依赖
```

`src/speech_phenomena` 使用可安装包，避免继续依赖 `PYTHONPATH=apps/api`。`requirements.txt` 如有需要由锁定环境导出，不作为另一份手工维护的依赖真相。Allophant/ZIPA 等历史依赖不能兼容时使用独立 legacy 环境，不为兼容旧实验限制新主线。

数据入口由 `SPEECH_DATA_ROOT`、`SPEECH_ARTIFACT_ROOT`、`SPEECH_MODEL_ROOT` 配置，manifest 存相对资源 ID 和内容哈希。原有绝对路径在历史清单中原样保存，通过迁移映射解析；不重写历史文件导致哈希失效。

## 4. 迁移范围与业务依赖解除

| 当前内容 | 迁移目标/处理 |
|---|---|
| `apps/api/scripts/sound_pilot/` | 先原样归档，再按 dataset/events/ipa/review 模块迁入新包；不边搬迁边改算法 |
| 引用研究包的 21 个测试文件 | 迁入独立 tests；与业务 Sound 测试分开 |
| 研究 `requirements.txt/mac-overrides.txt/models.lock.json` | 保存原件、实际安装快照、平台信息；新主线建立自己的锁 |
| `.cache/sound-pilot` 的原音频、标签、checkpoint、逐条输出 | 持久化到外置 store；内容哈希核对、目录映射、备份 |
| 可重算 features/下载缓存 | 独立 cache 区，可清理，但旧实验复现所需特征先保留 |
| `design/benchmarks/sound-*` 中研究报告 | 逐文件归类后迁入 reports；业务/UI 验收材料留 Libitu，原路径保留索引 |
| `prepare.py → annotate_sentence` | 旧候选结果作为带 rule-version 的冻结输入；新增研究候选生成使用独立词典适配，不导入业务 service |
| `glossika_corpus.py → recognize/model_fingerprint` | 从业务实现提取最小独立 ASR 适配，锁定模型/参数并做结果等价验证；业务实现不随迁移改动 |
| API 内 CMUdict 文件 | 研究方保存版本固定的独立数据副本和原来源说明，校验原字节哈希，不导入 API 包 |

Libitu 保留 `app/schemas/sound.py`、`sound_service.py`、Sound router、业务测试、前端、共享产品类型以及现有 ASR/MFA/韵律 worker。第一次迁移仅拆研究代码，不顺手重构既有声学业务链路。

迁移采用：盘点 → 保存代码快照与产物哈希 → 新仓库导入 → 新环境复现 → 核对通过 → 删除旧活动副本并留下指路文档。未提交研究代码也必须被快照覆盖。大文件按空间预算分批迁移，旧路径临时只读兼容；最终必须在没有 Libitu 源码的环境下运行。虚拟环境重建，数据与 checkpoint 不覆盖、不重训、不清理。

## 5. 数据与标签版本

每个样本至少有：`sample_id/corpus/source_revision/speaker_id/session_id/recording_id/audio_sha256/start_sample/end_sample/sample_rate/transcript/label_schema_version/provenance/quality_flags`。

事件标签独立记录 `kind/subtype/label/policy_version/annotation_origin/source_phone_ids/candidate_origin`，其中 label 为 `present/absent/unknown`。unknown 排除于监督 loss 和负例计数；没有源标签不代表 absent。词典候选、源音值、源音值派生事件、书本 IPA、自动模型预测分别保存。

`train.csv/dev.csv/test.csv` 可以保留，但只是样本 ID 清单。真正固定划分的是带哈希的 manifest、speaker/session/PCM 组及规则；仅有 split seed 不足以复现。新增增强、重采样片段继承父录音划分。记录重复句式和预训练覆盖未知，不把说话者隔离说成所有泄漏都已排除。

- 旧事件数据的 1,600/600/600 清单不变，用于迁移复现和历史回归。
- 新实验在未用于旧训练/调参/逐条误差分析的专业源组中清点新 holdout，执行去重和来源核验，登记 exposure ledger。若无法获得足够未曝光组，只报告回归改善，不声称盲测泛化。
- `dev-selection` 负责层/轮次选择，`dev-calibration` 负责阈值和拒识校准；按组划分，样本不足时使用预注册的分组交叉验证，不从 test 借数据。
- 当前同化候选累计 222 正/1,154 负，融合 25 正/66 负，均是源标签支持的保守派生数量；融合 dev 无可靠正例。先按说话者/环境审计覆盖，不为凑齐类别把 unknown 改成负例或打散说话者。
- Glossika 和历史 IPA 数据单独版本化；不把教材附标自动变成音频事件金标。沿用既有专业源标签，无需用户重新听辨。

## 6. E0–E3 实验计划

| 实验 | 改变项 | 对照与目的 |
|---|---|---|
| E0a：迁移复现 | 只改变代码位置/资源解析 | 六模型原 protocol + 旧缓存重算指标；原 predictions 和 RESULTS 哈希保留 |
| E0b：实际输入评测 | 源标注中心改为自动候选与预测边界 | 在相同评测录音上量化定位带来的下降、漏检、误报；训练也准备预测边界版本，防止训练/部署错位 |
| E1：MLP | 冻结底座，linear 换小型 MLP | 固定输入、pooling、样本、归一化、种子；判断非线性读出是否值得 |
| E2：局部解冻 | E1 的头 + 解冻顶部 2/4 层候选 | 保留卷积前端冻结，较小 encoder LR、独立 head LR；验证集早停与 checkpoint 选择 |
| E3：LoRA | E1 的头 + 注意力适配器 | 底座冻结；预先固定插入模块、rank/alpha/dropout；与 E2 比较质量、显存和延迟 |

主线先用 WavLM Large，原始 Wav2Vec2 同方案对照；WavLM Base+ 做部署成本候选。其余底座冻结结果保留，不默认全模型全组合搜索。MLP、顶部层数、LoRA 搜索预算在运行前写入配置。每个独立 arm 从同一原始 checkpoint 和配对初始化开始，不把 E2 的训练结果接着当 E3 起点；若热启动，必须单列实验。

E2/E3 优先以同样的 MLP 头、同样样本顺序/增强/训练上限比较；允许各自在相同预注册预算内选 LR。报告实际更新步数、曝光样本数、可训练参数、优化器、学习率、最佳轮次及运行成本。不能只写“同样 epoch”却忽略有效训练量差异。

E0b 是服务化的必经检查：当前负类只有保留 t/d，新增喉塞、删除、不同音、噪声等应作为明确负类或拒识域分别标注。模型不能把“不是保留 t/d”都当作闪音。候选定位使用服务时能获得的 transcript/词典/对齐输出，评测不得读取源真值边界或按真实 surface phone 挑候选。

语音现象可以重叠，未来使用逐子类二分类/多标签和缺失标签 mask，不用强制互斥的 12-way softmax。`fusion.py` 仅用于独立 audio+context 消融，保留 text-only 控制；不把尚无事件标签的 IPA 项硬并入主实验。

## 7. MLflow 与产物管理

使用 MLflow Tracking，初期单机 SQLite 元数据 + 外置本地 artifact store；以后多人/GPU 节点接入时再迁到共享数据库与对象存储。MLflow 官方将运行元数据与大产物分离：[Tracking Server](https://mlflow.org/docs/latest/tracking/server/)、[Artifact Stores](https://mlflow.org/docs/latest/self-hosting/architecture/artifact-store/)。MLflow 管比较和索引，不取代数据快照。

每个 run 强制记录：

| 类别 | 必须记录 |
|---|---|
| 代码/环境 | git commit、dirty patch 哈希或完整快照、Python/包锁、硬件、精度、确定性配置 |
| 模型 | Model ID + revision、权重 SHA256、层/pooling、原始监督背景、tokenizer/feature extractor 版本 |
| 数据 | dataset/label schema/候选策略版本、manifest/split 哈希、来源版本、种子、组划分、test exposure |
| 训练 | 完整解析后的 config、初始化、trainable parameters、优化器/学习率/调度、steps、batch、增强、早停规则 |
| 指标 | 各语料/说话者/子类 P/R/F1/AP、原始样本数、配对区间、拒识率、覆盖率、校准、端到端假阳性 |
| 产物 | checkpoint、归一化统计、校准/阈值、逐条预测、曲线、错误分析、训练日志、release manifest |

运行文件建议：

```text
store/runs/<run-id>/
  config.resolved.yaml   environment.json   provenance.json
  status.json           events.jsonl        metrics.json
  predictions.jsonl     selection.json      checkpoint/
  artifact-manifest.json
```

MLflow 中用父 run 表示实验、子 run 表示模型/arm/seed；旧实验可导入索引，但缺失的历史字段填 unknown，不编造“当时的 commit”。大文件保存一次，以不可变 URI + SHA256 引用，迁移时避免重复上传全量模型。

`status.json` 原子写入，单一 writer/运行锁；记录 run_id、阶段、进度、heartbeat、最后成功分片、错误。恢复任务前核对配置/数据/模型/预处理哈希，不能只依据文件存在就续跑。`complete` 必须在最终指标和 artifact manifest 校验成功后写入。PID 不作为跨主机持久身份；日志和分片进度用于诊断过时状态，不手工把 failed 当 complete。

普通 CLI 支持单次恢复和最终汇总。断点训练保存 optimizer/scheduler/RNG 状态；缺失这些状态只能新建 run，不能假称精确续训。Whisper 原生 waveform padding 的回归测试随迁移保留。

## 8. 何时允许发布为服务

冻结探针成绩只建立研发基线。沿用原技术方案的待冻结门槛，在新上线实验前确定，不能跑完再降低：

- 每个支持子类：目标域端到端 precision ≥ 0.90，按说话者/session 重采样的 95% 下界 ≥ 0.85；recall ≥ 0.70；可判覆盖率 ≥ 0.50。必须披露被拒识的正例以及全体 eligible 样本上的漏检，避免靠大量拒识美化指标。
- 自动定位、训练未见说话者、完整录音及学习者录音分别验证。源标注候选集成绩不能替代学习者域验收；无合适专业标注数据的域限制 capability，不要求用户手工补标。
- 检测阈值只在 dev calibration 上设定；新 holdout 一次性评估锁定候选。每种子及分域报告，不仅报告最好结果。
- 先提供词/候选窗口位置。未有高精度边界证据，不把 Buckeye 的 62.5 ms 量化标签当成 20 ms 边界真值。
- 逐项测试静音、截断、重叠、低质量、错句、非典型变体的拒识。未出现某个可选 GA 现象不直接判错或扣分。
- 目标部署硬件上测 5/15/30 秒录音、冷/热启动、并发、P50/P95、RTF、峰值 RAM/显存。现有方案的“热启动 10 秒录音 P95 ≤ 3 秒”只是待测工程目标，不能从笔记本离线速度推断已达成。
- 导出产物重载预测等价、失败恢复、版本回滚通过；原模型和历史结果始终可回溯。

只有通过的子类/候选环境进入 capability manifest；初版可以只有 `flap/tap` 的有限范围。同化、融合及其余类别逐项晋级，不统一标成“支持 12 类”。

## 9. 稳定后的服务与 Libitu 边界

```text
浏览器 → Libitu API（权限、录音身份、任务状态）
                ↓
        Libitu Sound evidence worker（独立可重试任务）
                ↓ HTTP /v1/analyze
        Speech inference service（常驻已发布模型）
                ↓ 版本化声学证据
        Libitu 校验身份与版本 → 持久化 → Sound 页面
```

研究/推理服务不访问 Libitu 业务数据库、不管理账号、不生成教学文案、不直接写产品结果。Libitu 不导入训练包，不读取某个实验目录中的“最新 checkpoint”。训练与推理使用不同依赖集和镜像；推理镜像只含已通过发布门槛的模型、预处理和必要 runtime。

服务初期用有界同步推理调用；对用户仍通过 Libitu 的持久异步任务呈现。复用现有任务租约/fencing 思路，但 Sound 检测用独立任务或独立阶段，不增加既有 fast/fine 成功条件。模型超时不阻断现有词匹配、Rhythm/Melody 与练习。

拟定内部请求包含：`request_id/audio_sha256/audio bytes or controlled artifact reference/sample_rate/target_accent/transcript_hash/tokenization_version/candidate_policy_version/candidates/requested_subtypes`。候选包含稳定 ID、词位、预测窗口及 `alignment_origin/version/quality`。首次发布固定一种候选来源，不混用研究真值边界。reference 与 learner 分别分析，通过不可变录音身份绑定；不把参考音的检测复制给用户音。

响应包含 `schema_version/model_release/artifact_sha256/preprocessing_version/calibration_version/capabilities/audio_sha256` 和逐候选 evidence。逐条给 `candidate_id/kind/subtype/state/score/window/anchor/quality/reason_codes`。分数未经校准不得称为可靠概率。`candidate` 仍属于文本教学提示；音频结果区分：

| 状态 | 意义 |
|---|---|
| detected | 在已验证能力范围内，证据达到正判门槛 |
| not_detected | 候选可判、已执行检测、达到负判门槛；不是发音错误 |
| insufficient_evidence | 质量/边界/域或分数不足，拒绝判定 |
| unsupported | 该子类或场景未获当前发布版本支持 |

服务故障属于 job unavailable/failed，不包装成 not_detected。首次只对已验证的候选域开放负判，其他非闪音变体不由二分类低分自动确认为负例。

Libitu 负责身份授权、短期输入访问、过期/删除、幂等、重试、入库和文案。结果写入再次核对 owner、audio digest、原始 take/reference、候选及模型版本和有效 lease；删除后的晚到结果丢弃。缓存键包含这些输入及预处理/模型/阈值版本，不能跨用户复用未经授权的录音结果。

模型 artifact 采用不可变 release ID，发布包包含权重、feature extractor、head、标准化参数、校准阈值、能力清单、训练/评测指针和校验和。新增版本先 shadow，仅记录指标；再按子类灰度，最后正式开放。回滚切回明确 release ID；历史结果保留当时版本，不默默重算。生产不直接追踪 MLflow 的可变 latest alias。

## 10. 执行顺序与验收

| 阶段 | 交付 | 完成标准 |
|---|---|---|
| P0 保全 | 源码/环境/数据/模型/报告/听辨原件清单、哈希、备份 | 未跟踪代码已保存；原始结果可核验；磁盘空间计划明确 |
| P1 独立运行 | 独立仓库/包/环境、解除三处业务依赖、测试迁移、资源解析 | 无 Libitu 源码可运行；新 API 安装不引入训练依赖；旧功能回归通过 |
| P2 可复现实验 | 六模型基线索引、MLflow、统一 CLI、run manifest | 旧预测重评分一致；代表样本重提特征/重载头满足预先规定数值容差；完整旧实验可复现 |
| P3 真实输入检查 | E0b、负类/unknown/数据曝光审计、端到端报告 | 区分源窗口与预测窗口；冻结训练/验证/新 holdout；确认不足后不作上线承诺 |
| P4 有限训练 | E1 → E2/E3 条件开展、三种子及误差报告 | 配置/预算相同口径；不以 test 选 checkpoint；选择质量与运行成本折中 |
| P5 发布与接入 | release 包、服务契约/镜像、Libitu 客户端、shadow/灰度/回滚 | 每子类 gate、目标域和性能验收通过后才开放真实检测 |

P1/P2 可立即作为下一实施阶段，P3 完成后再决定是否值得扩大训练。P5 不跟随目录迁移自动启动。

测试分层：常规 CI 只跑小型离线 fixtures、schema、数据规则、导入边界；模型 smoke 在显式模型任务中跑，不在 API 单测下载权重。长训练和完整 benchmark 单独触发。迁移 Libitu 结构时执行根 lint/build/test；服务集成阶段再做真实录音链路、任务失败/删除/重试与桌面/手机 Sound 证据展示验收。

迁移验收重点：数据/模型哈希不变；CPU 同环境重评分一致；更换平台推理误差按预定容差记录；划分交集为零；研究包不 import `app.*`；Libitu 不 import `speech_phenomena`；`inference.py` 不 import 训练/MLflow 模块；听辨原件可恢复。仅改路径不重新跑数小时训练来“证明”迁移成功。

执行迁移时更新 `PROJECT.MD/TASK.MD/DECISIONS.MD` 和旧报告入口，分别写明已迁移、已复现、实验完成与上线待验收。当前文件只记录提案。

## 11. 本地依据

- [当前研究包](../../apps/api/scripts/sound_pilot/)
- [冻结探针实现](../../apps/api/scripts/sound_pilot/event_probe.py)
- [补测实现及 Whisper 输入修复](../../apps/api/scripts/sound_pilot/event_extra_probe.py)
- [源数据、派生标签清点与原始结果](../benchmarks/sound-events-20261109/REPORT.md)
- [原始 Wav2Vec2 对照与配对区间](../benchmarks/sound-events-20261110-ssl/REPORT.md)
- [补测最终结果](../../.cache/sound-pilot/events-extra-v3-20261110/RESULTS.json)
- [现有模型方案及逐子类上线门槛](SOUND_IPA_ACOUSTIC_MODEL_IMPLEMENTATION_PLAN.md)
- [业务 Sound schema](../../apps/api/app/schemas/sound.py)
- [业务文本候选规则](../../apps/api/app/services/sound_service.py)
