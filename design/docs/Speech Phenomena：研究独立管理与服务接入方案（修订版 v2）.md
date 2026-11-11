# Speech Phenomena：研究独立管理与服务接入方案（修订版 v2）

日期：2026-11-11 · 状态：**提案，尚未迁移目录、启动新训练或接入业务服务** · 实验数字与代码现状沿用 v1，本版未重新核对。

## 1. 相对 v1 的修订

| # | v1 的问题 | v2 的处理 |
| --- | --- | --- |
| 1 | 门槛要求学习者域 precision，却不补标学习者数据，门槛永远测不出 | 首发只做**参考音（母语者）+ flap/tap**；学习者域改为独立后续目标，需小规模独立标注验收集（第 9 节） |
| 2 | 训练用研究侧候选，服务用 Libitu 文本规则候选，两边分布可能不同 | 候选生成归研究侧 `candidates/` 模块，服务端自行生成，并与 Libitu 文本提示做一致性核对（第 10 节） |
| 3 | precision 在构造集上算，基础率与真实使用不同；部分子类样本量撑不起门槛 | 门槛写明基础率、分母、样本量下限；做不到的子类标 unsupported（第 9 节） |
| 4 | 主线偏向 WavLM Large，差异实际在噪声内 | E0b 同时跑三个底座（第 7 节） |
| 5 | 先搭基础设施，最大不确定性（自动定位）最后才测 | 顺序改为 P0 保全 → E0b → 决策点 D1 → 迁移（第 11 节） |
| 6 | E2/E3 没有进入条件 | 以 E0b 错误分析为闸门（第 7 节） |
| 7 | 缺许可核查、备份细则、信道鲁棒、标注上限；运行状态有三套来源 | 新增第 12 节；运行目录作为唯一真相（第 8 节） |

## 2. 当前事实与决策

事实（沿用 v1）：

- `apps/api/scripts/sound_pilot/` 有 52 个 Python 文件，21 个测试文件引用；`apps/api/app/` 未直接引用研究包，但研究反向依赖业务：`prepare.py` 调用 `sound_service.annotate_sentence`，`glossika_corpus.py` 调用业务 ASR 的 `recognize/model_fingerprint`，事件构建读取 API 内 CMUdict。
- 研究依赖已有独立 requirements 与 `.cache/sound-pilot/venv`，但目录、测试发现、词典、根路径仍耦合；Intel macOS override 不代表其他平台。
- 大量研究脚本与测试未被 Git 跟踪，工作区同时有业务改动：迁移前必须独立保全，不得用还原工作区清理。
- 数据、模型、听辨结果、实验产物在 `.cache/sound-pilot`，其中很多**不可重建**。
- `PROJECT.MD` 等活文档的补测段落仍写 pending，实际已完成，迁移时纠正并保留过程记录。

**决定：一个独立研究仓库 + 一个外置 store；稳定后由研究仓库构建独立推理服务；Libitu 只维护客户端与业务编排。** 暂不拆第三个仓库。

| 路径 | 职责 |
| --- | --- |
| `/Users/river/Documents/speech-phenomena/` | 研究仓库：代码、配置、测试、报告；不进 Libitu 的 pnpm/Turbo 工作区 |
| `/Users/river/Documents/speech-phenomena-store/` | 外置 store：数据、模型、运行产物、MLflow、发布包；以后可迁独立磁盘或对象存储 |
| `/Users/river/Documents/Libitu/` | 产品、业务 API、账号权限、任务、持久化、展示 |

## 3. 模型选择依据与边界

同一 1,600/600/600 划分、三个种子的纯音频闪音 F1：

| 底座 | Buckeye | TIMIT | 角色 |
| --- | --: | --: | --- |
| WavLM Large | 88.59% | 94.66% | 候选 |
| 原始 Wav2Vec2 Large | 88.15% | 93.26% | 必保留对照 |
| Whisper Small encoder | 87.76% | 94.80% | 候选（TIMIT 最高，成本低） |
| WavLM Base+ | 87.21% | 93.56% | 资源与延迟候选 |
| HuBERT Large | 84.63% | 93.03% | 冻结历史基线 |
| data2vec Audio Large | 82.85% | 94.55% | 冻结历史基线 |

- WavLM Large 与 Wav2Vec2 Large 的配对说话者 bootstrap 区间在两语料上均跨零；Whisper 是经 ASR/翻译监督的 Small 编码器，不是等条件的纯架构对比。**多数差异在噪声内，不据此指定唯一主线。**
- 当前任务是人工源边界附近、特定词典环境中的闪音 vs 保留 /t,d/；裁剪中心来自源标注时间，尚未完成自动定位，也未覆盖喉塞等负类。现有 test 已曝光，只作 regression-v1，不能重新随机划分后称盲测。

## 4. 项目结构

### 4.1 仓库目录（speech-phenomena/）

```text
speech-phenomena/
  README.md  AGENTS.md
  pyproject.toml            # 单包；依赖分组 core / train / serve / review
  uv.lock                   # 经验证的平台锁；不复制旧 venv
  environments/             # 历史环境快照；legacy 环境（Allophant/ZIPA 等）说明
  docs/
    decisions/              # 本方案、D1 结论等决策记录
    licenses.md             # 数据/权重/词典许可核查表（第 12 节）
    migration/              # 路径映射、哈希清单、旧实验来源
  configs/
    labels.yaml             # 类别、子类、标签来源、unknown 规则
    candidate-policy/       # 候选生成规则，版本化
    datasets/               # 源版本与构建参数
    models/                 # 底座 ID、revision、权重哈希、预处理
    experiments/            # E0a/E0b/E1/E2/E3 固定配置（含预算、增强）
    release-gates.yaml      # 发布门槛、D1 止损条件、样本量下限；运行前冻结
  data/
    registry/               # 小型来源锁、manifest、审计、版本索引（入 Git）
    splits/<dataset-version>/   # ID 清单、组别、哈希、划分规则（入 Git）
  src/speech_phenomena/
    core/                   # paths、schema、audio_io、features、契约类型；仅轻依赖
    candidates/             # 词典适配、候选生成、对齐接口；训练与服务共用
    datasets/               # Buckeye/TIMIT/Glossika/SAA 适配与审计
    models/                 # encoder、classifier、fusion 的前向代码（不含训练）
    tasks/events/           # 当前主线：局部现象分类
    tasks/ipa/              # 历史 IPA 研究，独立保存，不作前置依赖
    training/               # train、evaluate、calibrate、tracking（MLflow 只在此）
    inference/              # 纯推理
    review/                 # 听辨/比较页面与本地研究工具
    cli.py
  experiments/              # E0a/E0b/E1/E2/E3：协议、配置、运行索引；不放大权重
  contracts/v1/             # 请求/响应 JSON Schema 与合成样例
  tests/                    # unit / data / contract / repro / integration
  reports/                  # baseline、error_analysis、annotation_ceiling、final_comparison
  archive/                  # 历史源码与环境记录，不再开发
  serving/                  # 通过发布门槛后实现；独立镜像与依赖
```

### 4.2 导入边界（CI 用导入检查强制）

| 模块 | 允许依赖 | 禁止 |
| --- | --- | --- |
| `core` | 标准库与轻量包 | 其他所有模块 |
| `candidates` | `core` | `training`、`models` |
| `models` | `core` | `training`、MLflow |
| `inference` | `core`、`candidates`、`models` | `training`、MLflow、`review` |
| `training` | 以上全部 | `serving` |
| `review` | `core`、`datasets` | `training` |
| 全仓库 | — | 导入 Libitu 的 `app.*`；Libitu 也不导入 `speech_phenomena` |

### 4.3 外置 store（speech-phenomena-store/）

```text
speech-phenomena-store/
  raw/<corpus>/<source_revision>/    # 只读原始语料            【A 不可重建】
  listening/                         # 听辨原件与结果          【A】
  annotations/                       # 原始标签、修订、派生规则分别存放  【A】
  legacy/sound-pilot-snapshot/       # P0 代码与环境快照       【A】
  models/<model-id>/<revision>/      # 基础权重与校验和        【B 可重新下载】
  processed/<dataset-version>/       # 处理后数据              【B】
  cache/                             # features、下载缓存      【B；旧实验复现所需特征先保留】
  runs/<run-id>/                     # 运行目录：唯一真相      【A：含 checkpoint、预测】
  mlflow/                            # SQLite 元数据 + artifact store（索引，可重建）
  releases/<release-id>/             # 不可变发布包            【A】
  BACKUP-MANIFEST.json               # 全部 A 级文件的 SHA256 清单
```

### 4.4 路径与配置

- 根目录由 `SPEECH_DATA_ROOT`、`SPEECH_ARTIFACT_ROOT`、`SPEECH_MODEL_ROOT` 配置；manifest 存相对资源 ID 与内容哈希。
- 历史清单中的绝对路径原样保存，通过迁移映射解析，不重写文件以免哈希失效。
- 依赖以 `uv.lock` 为准，`requirements.txt` 如需要由锁导出，不手工维护第二份。

### 4.5 Libitu 侧

- 保留：`app/schemas/sound.py`、`sound_service.py`（文本教学提示）、Sound router、业务测试、前端、现有 ASR/MFA/韵律 worker。
- 新增（P5 才做）：由 `contracts/v1` 生成的契约客户端、独立的 Sound evidence worker。
- 第一次迁移只拆研究代码，不顺手重构既有声学业务链路。

## 5. 迁移范围

| 当前内容 | 处理 |
| --- | --- |
| `apps/api/scripts/sound_pilot/` | 先原样归档，再按 datasets/tasks/review 迁入；不边搬边改算法 |
| 引用研究包的 21 个测试文件 | 迁入独立 tests，与业务 Sound 测试分开 |
| requirements / mac-overrides / models.lock.json | 保存原件与实际安装快照；新主线建立自己的锁 |
| `.cache/sound-pilot` 中的音频、标签、checkpoint、逐条输出 | 按 4.3 分级迁入 store，内容哈希核对 |
| `design/benchmarks/sound-*` | 逐文件归类；研究报告入 `reports/`，业务验收材料留 Libitu，原路径留索引 |
| `prepare.py` → `annotate_sentence` | 旧候选结果作为带 rule-version 的冻结输入；新候选走 `candidates/`，不导入业务 service |
| `glossika_corpus.py` → 业务 ASR | 提取最小独立 ASR 适配，锁定模型/参数，做结果等价验证；业务实现不动 |
| API 内 CMUdict | 保存版本固定副本与来源说明，校验原字节哈希 |

流程：盘点 → 快照与哈希 → 新仓库导入 → 新环境复现 → 核对 → 删除旧活动副本并留指路文档。未提交代码必须被快照覆盖；虚拟环境重建，数据与 checkpoint 不覆盖、不重训、不清理。

## 6. 数据与标签版本

每个样本至少含：`sample_id / corpus / source_revision / speaker_id / session_id / recording_id / audio_sha256 / start_sample / end_sample / sample_rate / transcript / label_schema_version / provenance / quality_flags`。

- 事件标签记录 `kind / subtype / label / policy_version / annotation_origin / source_phone_ids / candidate_origin`；label 取 present / absent / unknown，**unknown 不进监督 loss，也不计入负例**。词典候选、源音值、派生事件、书本 IPA、自动预测分别保存。
- `train/dev/test.csv` 仅是 ID 清单；真正固定划分的是带哈希的 manifest、说话者/session/PCM 组及规则。增强与重采样片段继承父录音划分。
- 旧 1,600/600/600 清单不变，用于复现与 regression-v1。
- 新增**真实基础率评测集**：在完整录音上取全部 eligible 候选，不按类别构造；用于估计真实使用下的 precision 与每分钟误报数。
- 新 holdout 从未用于旧训练、调参、逐条误差分析的专业源组中清点，登记 exposure ledger；不足则只报告回归改善，不称盲测泛化。
- `dev-selection` 负责层/轮次，`dev-calibration` 负责阈值与拒识校准，均按组划分；样本不足用预注册的分组交叉验证，不从 test 借数据。
- 当前同化候选 222 正/1,154 负，融合 25 正/66 负（均为源标签支持的保守派生数）；融合 dev 无可靠正例，先审计覆盖，不把 unknown 改成负例。
- Glossika 与历史 IPA 数据单独版本化，教材附标不自动成为音频事件金标。

## 7. 实验计划

### 7.1 E0b：实际输入评测（P1，在旧位置原位运行）

- **底座：WavLM Large、WavLM Base+、Whisper Small encoder 三个都跑**（Wav2Vec2 Large 作可选对照），沿用冻结探针，成本低。
- 输入改为自动候选 + 预测边界，在完整录音上评测，量化定位带来的漏检与误报；训练同时准备预测边界版本，避免训练/部署错位。
- 负类显式覆盖保留 t/d、喉塞、删除、不同音、噪声；模型不得把「不是保留 t/d」都当闪音。
- 候选定位只用服务时可得的 transcript、词典、对齐输出，不读源真值边界，不按真实 surface phone 挑候选。
- 增加信道切片：加噪、混响、编码压缩、手机/网页麦克风模拟；按设备与信噪比分别报告。

### 7.2 错误分析与标注上限

- 抽 100 条错例（假阳 50、漏检 50），分为：标注可疑 / 边界模糊 / 模型真错，写入 `reports/error_analysis`。
- 优先查语料文档中的标注一致性；没有则用上述抽样估计标注噪声上限（`reports/annotation_ceiling`）。沿用专业源标签，不要求重新听辨全量数据。

### 7.3 决策点 D1（E0b 之前把阈值冻结进 `release-gates.yaml`）

| 结果 | 动作 |
| --- | --- |
| 真实基础率下端到端 precision 的 95% 下界 ≥ T1，且定位召回 ≥ T2 | 进入 P2 迁移与 E1 |
| 定位是主要损失 | 先改进候选与定位，不训练 |
| 标注噪声是主要损失 | 修标注或报告上限，不进 E2/E3 |
| 均不满足 | 暂停服务化，仅保留研究与 P0 保全 |

T1、T2 建议起点均为 0.80，**仅为建议，需你确认后冻结**。

### 7.4 E0a、E1–E3

| 实验 | 改变项 | 目的 |
| --- | --- | --- |
| E0a 迁移复现 | 只改代码位置/资源解析 | 六模型原协议重算，原 predictions 与 RESULTS 哈希保留 |
| E1 MLP | 冻结底座，linear 换小型 MLP | 固定输入、pooling、样本、种子；判断非线性读出是否值得 |
| E2 局部解冻 | E1 头 + 解冻顶部 2/4 层 | 卷积前端冻结，encoder 与 head 学习率分开 |
| E3 LoRA | E1 头 + 注意力适配器 | 底座冻结；rank/alpha/dropout 预先固定；与 E2 比质量、显存、延迟 |

- **E2/E3 进入条件**：通过 D1，且错误分析中「模型真错」占比达到预注册阈值（建议 ≥ 50%）；否则微调只会拟合噪声。E1 可先行。
- 每个 arm 从同一原始 checkpoint 与配对初始化开始，不把 E2 结果当 E3 起点；热启动须单列实验。
- 相同 MLP 头、样本顺序、增强与训练上限；各自在同一预注册预算内选学习率。报告更新步数、曝光样本数、可训练参数、优化器、最佳轮次与成本。
- E1–E3 增加信道增强选项，并按设备/信道切片评测。
- 现象可重叠：用逐子类二分类/多标签 + 缺失标签 mask，不用互斥 softmax。`fusion.py` 只用于独立 audio+context 消融，保留 text-only 控制。

## 8. 追踪与产物

MLflow Tracking：初期单机 SQLite 元数据 + 外置本地 artifact store，多人/GPU 节点出现时再迁共享库与对象存储。**运行目录是唯一真相，MLflow 只做比较与索引，由运行目录同步生成。**

```text
store/runs/<run-id>/
  config.resolved.yaml  environment.json  provenance.json
  status.json  events.jsonl  metrics.json  predictions.jsonl
  selection.json  checkpoint/  artifact-manifest.json
```

| 类别 | 必须记录 |
| --- | --- |
| 代码/环境 | git commit、dirty patch 哈希或完整快照、包锁、硬件、精度、确定性配置 |
| 模型 | Model ID + revision、权重 SHA256、层/pooling、预处理版本 |
| 数据 | dataset/label schema/候选策略版本、manifest 与 split 哈希、种子、test exposure |
| 训练 | 解析后 config、初始化、可训练参数、优化器/学习率、steps、增强、早停规则 |
| 指标 | 各语料/说话者/子类 P/R/F1/AP、原始样本数、配对区间、拒识率、覆盖率、校准、端到端误报 |
| 产物 | checkpoint、归一化统计、校准/阈值、逐条预测、错误分析、日志、release manifest |

- `status.json` 原子写入；`complete` 只在最终指标与 artifact manifest 校验通过后写入；续跑前核对配置/数据/模型/预处理哈希。
- 断点训练保存 optimizer/scheduler/RNG 状态，缺失则只能新建 run。
- **单机阶段不引入心跳、跨主机运行锁与分片恢复**，多机训练出现时再加。
- 旧实验可导入索引，缺失的历史字段填 unknown，不编造当时的 commit。
- Whisper 原生 waveform padding 的回归测试随迁移保留。

## 9. 发布门槛（在新上线实验前冻结，不能跑完再降低）

**首发范围：参考音（母语者）+ flap/tap。** 学习者音频在 Gate L 通过前返回 unsupported。

### Gate A：参考音，每个支持子类

- 评测集为完整录音上全部 eligible 候选，真实基础率；构造集成绩只作对照。
- precision ≥ 0.90，按说话者/session 重采样的 95% 下界 ≥ 0.85；同时报告每分钟音频误报数。
- recall ≥ 0.70，**分母为全部 eligible 正例，被拒识的正例计为漏检**；可判覆盖率 ≥ 0.50 单独披露。
- 样本量下限（建议）：test 正例 ≥ 100 且来自 ≥ 20 位说话者；不足则该子类标 unsupported，不降低门槛。
- 阈值只在 dev-calibration 上设定，新 holdout 一次性评估锁定候选；报告每种子与分域结果，不只报最佳。
- 自动定位、未见说话者、完整录音分别验证；静音、截断、重叠、低质量、错句、非典型变体逐项测拒识。
- 先给词/候选窗口位置；无高精度边界证据，不把 Buckeye 62.5 ms 量化标签当 20 ms 边界真值。
- 目标硬件上测 5/15/30 秒录音的冷/热启动、并发、P50/P95、RTF、峰值内存；热启动 10 秒 P95 ≤ 3 秒只是待测目标。
- 导出产物重载预测等价、失败恢复、版本回滚通过。

### Gate L：学习者域（后续，独立于首发）

- 采集学习者录音，由两位标注者独立标注候选，规模按置信区间宽度预先计算；κ 不低于预设下限（建议 0.7）才可作验收集。
- 验收集只用于验收与校准，不进训练。
- 未通过前，学习者音频一律 unsupported，不用参考音成绩替代。

### 子类晋级

融合等样本量不足的子类（现有融合仅 25 正例）在统计上过不了门槛，标为研究子类，暂不进入晋级评估。同化、融合及其余类别逐项晋级，不统一标成支持 12 类。

## 10. 服务与 Libitu 的边界

```text
浏览器 → Libitu API（权限、录音身份、任务状态）
            ↓
     Libitu Sound evidence worker（独立可重试任务）
            ↓ HTTP /v1/analyze
     Speech inference service（常驻已发布模型）
            ↓ 版本化声学证据
     Libitu 校验身份与版本 → 持久化 → Sound 页面
```

- 推理服务不访问 Libitu 数据库、不管理账号、不生成教学文案；Libitu 不导入训练包，不读取某实验目录的最新 checkpoint。训练与推理依赖、镜像分开。
- 服务初期有界同步推理；对用户仍通过 Libitu 的持久异步任务呈现。Sound 检测用独立任务或阶段，不加入既有 fast/fine 成功条件；模型超时不阻断词匹配、Rhythm/Melody 与练习。

### 候选归属（修订）

- 请求携带 `request_id / audio_sha256 / 音频或受控引用 / sample_rate / target_accent / transcript + transcript_hash / tokenization_version / candidate_policy_version / requested_subtypes`，可选 `expected_candidate_ids`。
- **服务端用 `candidates/` 自行生成候选**，返回候选及 `alignment_origin / version / quality`；候选策略版本由研究侧定义，Libitu 只透传。
- Libitu 用自己的文本提示与返回候选比对：不一致的候选只展示文本提示，音频证据按 insufficient\_evidence 处理。shadow 阶段必须报告两侧候选一致率与分歧样例。
- reference 与 learner 分别分析，通过不可变录音身份绑定，不把参考音检测复制给用户音。

### 响应与状态

响应含 `schema_version / model_release / artifact_sha256 / preprocessing_version / calibration_version / capabilities / audio_sha256`，逐候选含 `candidate_id / kind / subtype / state / score / window / anchor / quality / reason_codes`。分数未经校准不得称为概率。

| 状态 | 意义 |
| --- | --- |
| detected | 在已验证能力范围内，证据达到正判门槛 |
| not\_detected | 候选可判、已执行检测、达到负判门槛；不是发音错误 |
| insufficient\_evidence | 质量/边界/域或分数不足，拒绝判定 |
| unsupported | 该子类或场景未获当前发布版本支持 |

服务故障属于 job unavailable/failed，不包装成 not\_detected；首次只对已验证候选域开放负判。

### 持久化与发布

- Libitu 负责身份授权、短期输入访问、过期/删除、幂等、重试、入库与文案；写入前再核对 owner、audio digest、候选、模型版本与有效 lease；删除后的晚到结果丢弃。缓存键含这些输入及预处理/模型/阈值版本，不跨用户复用。
- 模型以不可变 release ID 发布：权重、feature extractor、head、标准化参数、校准阈值、能力清单、训练/评测指针与校验和。流程：shadow（只记录指标）→ 按子类灰度 → 正式开放；回滚切回明确 release ID；历史结果保留当时版本；生产不追踪 MLflow 的 latest alias。

## 11. 执行顺序与验收

| 阶段 | 交付 | 完成标准 |
| --- | --- | --- |
| P0 保全 | 源码/环境/数据/模型/报告/听辨原件清单、哈希、备份；未跟踪代码入快照 | 原始结果可核验；A 级文件完成第二份备份并**抽样恢复演练**通过 |
| P1 E0b（原位） | 三底座真实输入评测、信道切片、错误分析、标注上限 | 不依赖新仓库；报告写清源窗口与预测窗口的差距 |
| D1 决策 | 按 7.3 表作出继续/改进定位/修标注/暂停 | 阈值事先冻结；结论写入 `docs/decisions/` |
| P2 独立运行 | 新仓库/包/环境、解除三处业务依赖、测试迁移、资源解析 | 无 Libitu 源码可运行；研究包不 import `app.*`；旧功能回归通过 |
| P3 复现与追踪 | E0a、六模型索引、MLflow、统一 CLI、run manifest | 旧预测重评分一致；代表样本重提特征/重载头满足预定容差；划分交集为零 |
| P4 有限训练 | E1，条件满足再 E2/E3，三种子与误差报告 | 口径一致；不以 test 选 checkpoint；质量与成本折中 |
| P5 发布与接入 | release 包、服务契约/镜像、Libitu 客户端、shadow/灰度/回滚 | Gate A 与性能验收通过；Gate L 通过后才开放学习者域 |

- D1 未通过时，P2 只做去除业务依赖与保全相关的最小整理，不启动服务化。
- 测试分层：常规 CI 只跑小型离线 fixtures、schema、数据规则、导入边界；模型 smoke 显式触发；长训练与完整 benchmark 单独触发。
- 迁移验收：数据/模型哈希不变；CPU 同环境重评分一致；跨平台推理误差按预定容差记录；`inference` 不 import 训练/MLflow；Libitu 不 import `speech_phenomena`；听辨原件可恢复。仅改路径，不重跑数小时训练来证明迁移成功。
- 迁移时更新 `PROJECT.MD/TASK.MD/DECISIONS.MD` 与旧报告入口，分别写明已迁移、已复现、实验完成、上线待验收。

## 12. 许可、备份与风险

### 许可核查（`docs/licenses.md`，P0 内完成）

| 资源 | 用途 | 状态 |
| --- | --- | --- |
| Buckeye、TIMIT | 训练与评测 | 待核查：是否允许商用，及训练出的模型能否对外服务 |
| Glossika/SAA 数据 | 训练或展示 | 待核查 |
| WavLM、Wav2Vec2、Whisper、HuBERT、data2vec 权重 | 微调与部署 | 待核查：许可条款与再分发限制 |
| CMUdict 副本 | 候选生成 | 待核查并保留来源说明 |

语料常见学术或会员协议限制，具体条款我未核实。许可结论出来前，不做对外发布。

### 备份

- A 级（不可重建）：原始语料、听辨原件、标注修订、checkpoint、E0 结果、发布包。至少两份独立介质，其中一份异地或云；`BACKUP-MANIFEST.json` 记录 SHA256。
- 抽样恢复并校验通过后，才允许删除旧活动副本。
- B 级（可重建）：可清理，但旧实验复现所需特征先保留。

### 主要风险

| 风险 | 对策 |
| --- | --- |
| 自动定位下性能显著下降 | E0b 先测；D1 止损 |
| 标注噪声限制上限 | 抽样估计上限；先修标注再微调 |
| 样本量不足的子类 | 样本量下限；标 unsupported 或研究子类 |
| 手机/网页信道与实验室语料不同 | 信道增强与切片评测；学习者域走 Gate L |
| 许可不允许商用 | P0 核查；结论前不对外发布 |

## 13. 本地依据

- 当前研究包：`apps/api/scripts/sound_pilot/`
- 冻结探针实现：`apps/api/scripts/sound_pilot/event_probe.py`
- 补测实现及 Whisper 输入修复：`apps/api/scripts/sound_pilot/event_extra_probe.py`
- 源数据、派生标签清点与原始结果：`design/benchmarks/sound-events-20261109/REPORT.md`
- 原始 Wav2Vec2 对照与配对区间：`design/benchmarks/sound-events-20261110-ssl/REPORT.md`
- 补测最终结果：`.cache/sound-pilot/events-extra-v3-20261110/RESULTS.json`
- 现有模型方案及逐子类上线门槛：`SOUND_IPA_ACOUSTIC_MODEL_IMPLEMENTATION_PLAN.md`
- 业务 Sound schema 与文本候选规则：`apps/api/app/schemas/sound.py`、`apps/api/app/services/sound_service.py`
