# Speech Phenomena：评审结论与统一执行方案 v3

日期：2026-11-11。状态：**用户已确定三项范围选择；本文件完成方案，不表示代码已迁移、新实验已运行或服务已发布。**

输入：[原方案](SPEECH_PHENOMENA_RESEARCH_SEPARATION_PLAN.md)、[修订版 v2](Speech%20Phenomena：研究独立管理与服务接入方案（修订版%20v2）.md)、现有研究代码及冻结结果。两份输入文件保留，不覆盖历史提案。

## 1. 用户已确认的选择

1. **参考音先发，学习者域以后单独验收。** 首发限于实际验证过的参考音场景和有限 flap/tap 子类。现有用户录音、词匹配、Rhythm/Melody 不受影响。
2. **先最小拆分，再跑 E0b，深度重构后置。** 工程独立管理不以某次模型分数为前提；是否扩大训练、建设服务由后续证据决定。
3. **先只用现有专业数据，不足的能力暂不发布。** 不要求用户再次听辨，不启动外部付费标注，也不把自动预测冒充专业复核。

本方案不把新模型服务、云训练资源采购或公开发布视为已经执行。迁移实施是下一工作包；训练与发布各有独立验收条件。

## 2. 对 v2 的评审

### 2.1 同意并保留

| v2 改进 | 理由与采用方式 |
|---|---|
| 独立研究仓库 + store，暂不拆第三仓库 | 隔离依赖、测试和发布节奏；服务代码以后仍由研究仓库构建 |
| 先验证自动候选/预测边界 | 当前窗口中心来自源音值边界，离线候选二分类成绩不能证明完整录音检测 |
| 自然分布评测、拒识正例计漏检 | 不按正负例比例人为抽样；防止通过丢弃难例提高 precision/recall |
| 参考音与学习者域分别验收 | 现有证据不能证明学习者音的泛化；也不能用训练背景推断模型适用人群 |
| 单一运行档案，MLflow 为可重建索引 | 避免运行目录、MLflow、状态页相互矛盾 |
| 模块导入约束、不可变发布包、备份恢复 | 能把研究迭代与业务行为变更隔开，并保全已完成实验 |
| 信道压力测试、逐子类晋级、多标签与 unknown mask | 与真实输入问题一致；缺标签不能制造负例 |
| E2/E3 设置进入条件 | 在数据、定位问题未排除前不盲目增加训练复杂度 |

### 2.2 不同意或需要改写

| v2 条款 | 问题 | v3 决定 |
|---|---|---|
| D1 达标才迁移 | 数据保全与业务解耦不取决于模型质量；原位扩展还会增加迁移工作 | 先最小拆分/E0a，再 E0b；完整重构、MLflow 完善后置 |
| Whisper Small“成本低” | 参数小不等于当前实现便宜；本机 test 分片累计约 2,098.4 秒/600 条，data2vec 约 212.7 秒/600 条，且处理方式不同 | 删除成本结论，单列实际推理成本；这些是离线提取时间，不是生产延迟或公平架构成本比较 |
| “多数差异在噪声内” | 已有配对区间只直接支持 WavLM Large 与原始 Wav2Vec2 未显示显著差异；不显著也不等于等效 | 不推断所有模型配对。E0b 主矩阵保留这两者，加入 WavLM Base+、Whisper Small |
| Wav2Vec2 变成可选对照 | 用户此前明确要求测试原始 Wav2Vec2；现有分数也没有排除它 | `facebook/wav2vec2-large-lv60` 保留为必测对照，不换回 Phoneme checkpoint |
| 从 50 FP + 50 FN 估计标注上限 | 这是以模型错误为条件的抽样，不能估计总体标签错误率；没有独立裁决不能确定“标签错” | 用于错例诊断，报告为 label audit/uncertainty，不叫 annotation ceiling |
| “模型真错 ≥50% 才微调，否则只会拟合噪声” | 分类有主观不确定性，固定比例无证据；同时存在标签问题与可学习错误并不互斥 | 以可信监督规模、可定位残差、验证集小预算实验决定；不设 50% 硬闸门 |
| D1 的 0.80/0.80 直接决定停止 | 候选、定位、分类、拒识混在一起，低分未必是底座问题；区间宽也可能只是样本不足 | 0.80 可作研发观察目标，不当迁移或永久停训条件；D1 依据分解诊断作下一步决策 |
| 只需 100 正例、20 说话者 | 不能保证 precision 区间；precision 的样本基数是预测阳性，且说话者内相关会减少有效信息 | 作为样本规划起点，另外审计阴性、预测阳性、说话者分布和区间宽度；不自动等于通过 |
| 验收集“用于验收与校准” | 调阈值/校准参数会利用验收标签，使其不再是独立最终测试 | 分开 learner-dev-calibration 和 learner-test，参考音也同样隔离 |
| κ≥0.7 才能作为验收集 | 单一一致性统计不能保证标签正确或覆盖充分，且受类别比例影响；本轮没有双人新标注资源 | 本轮使用已有专业标签与来源审计；不把双人新标注列为前置条件 |
| 单机不做心跳与分片恢复 | 已发生过长跑中断/过时状态；单机同样有重启、重复运行和丢计算风险 | 保留轻量更新时刻、单写者锁、分片校验和恢复；不建设分布式调度 |
| 候选与 UI 提示不一致就改为 insufficient_evidence | 规则覆盖与声学证据是不同问题；提示策略差异不能抹掉正确的声学判断 | 检测候选归研究服务；UI 映射状态独立，映射失败不改写原 evidence |
| 参考音等于母语者/GA | 参考音是产品角色，不能自动认证说话者口音与录制条件 | capability 描述已验证来源/环境，不根据角色凭空断定母语或 GA |
| 信道模拟证明手机/网页泛化 | 合成噪声/编码可诊断敏感性，不能替代真实设备或学习者证据 | 合成切片与真实录音结果分表展示 |

许可/来源说明保留作资源元数据。本轮不另加许可确认或采购审批来阻塞用户已授权的离线数据工作；对外发布未在本次执行范围，不在此作许可结论。

## 3. 目标结构与依赖边界

```text
/Users/river/Documents/
  Libitu/                         # 业务代码、账号、任务、教学与展示
  speech-phenomena/                # 独立 Git / Python 包 / CI
    README.md  AGENTS.md  pyproject.toml  uv.lock
    environments/                 # 历史与平台环境，legacy 单独隔离
    configs/
      labels.yaml  candidate-policy/  datasets/  models/
      experiments/  release-gates.yaml
    data/registry/                # 来源、manifest、数据审计
    data/splits/<version>/        # train/dev-selection/dev-calibration/test
    src/speech_phenomena/
      core/                       # schema、paths、audio I/O、轻量公共函数
      candidates/                 # 文本候选策略，不含神经网络/训练
      alignment/                  # 可替换定位适配，不依赖 Libitu
      datasets/                   # 来源解析、划分、监督构建
      models/                     # 编码器/分类头/融合前向代码
      training/                   # 训练、验证、校准、tracking
      evaluation/                 # 离线评分、区间、诊断
      inference/                  # 已发布模型的推理与组合
      tasks/events/  tasks/ipa/    # 事件主线与独立历史 IPA 任务
      review/  cli.py
    experiments/  reports/  contracts/v1/  tests/
    docs/decisions/  docs/migration/  archive/
    serving/                      # gate 通过后才实现
  speech-phenomena-store/
    raw/  annotations/  listening/  legacy/
    models/  processed/  cache/  runs/  mlflow/  releases/
```

上述目录是最终责任边界，不要求最小迁移时把 52 个文件全部深度重写。第一步保留内部相对导入关系，把资源解析和业务依赖解除，其他模块在新增工作涉及时再整理。

导入规则：core 不导入其他内部模块或 MLflow；candidates 只依赖 core/固定词典；alignment 可依赖定位 runtime，但不依赖训练；models 不依赖 training/MLflow；inference 可组合 core/candidates/alignment/models，不导入 training/evaluation/review。training 与 evaluation 可以调用前向模块；Libitu 不 import `speech_phenomena`，研究方不 import `app.*`。

重型神经特征放 models 或 inference，不塞进“轻依赖 core”。`train/serve/review/legacy` 分环境或依赖组；不为 Allophant/ZIPA 的历史兼容限制新主线。先保留实际安装快照，再验证锁文件和平台安装，不复制旧 venv。

## 4. 最小迁移与保全

1. 盘点当前 52 个 Python 文件、21 个研究测试，以及静态页面、听辨原件、模型锁、结果、未跟踪文件和 symlink；数量为 2026-11-11 实查值。
2. 保存源码快照、Git 状态、必要的未提交差异与实际环境记录。只记录研究范围，敏感配置和密钥不进入快照。
3. 不可替代标注、修订、checkpoint、预测/报告至少保存第二份校验副本；仅在另一目录建立副本不称为异地/独立介质备份。若无独立介质，登记缺口、保留原件，允许继续非破坏性迁移，但不清理旧数据。
4. 新仓库建立可安装包、独立 tests 和路径解析；所有运行路径从 `SPEECH_DATA_ROOT / SPEECH_ARTIFACT_ROOT / SPEECH_MODEL_ROOT` 注入。
5. `prepare.py` 的旧业务候选先保留为冻结输入；新增代码走研究 candidates。Glossika 的 ASR 调用迁成最小独立适配器；CMUdict 保留同字节固定副本与来源。
6. 保存旧清单、哈希、路径映射，不修改历史 manifest 中的绝对路径来“修复”引用。不能把只靠 Libitu symlink 才能运行的状态称为独立运行。
7. E0a 重评分旧预测，核对指标；代表性片段重提特征、重载头检查数值；保留 Whisper waveform padding 回归测试。无需仅为迁移重跑所有训练。
8. 通过核验后停止维护 Libitu 中旧活动代码，留下入口说明；大数据原件直到恢复验证、空间与备份条件满足才另行清理。

不迁走业务的 `sound_service.py`、Sound schema/router、前端、现有声学 workers 和业务测试。研究报告按内容归类，不能以 `sound-*` 通配符误迁 UI 验收材料。

## 5. 数据账本与评测单位

每个样本保持原 source revision、recording/PCM hash、speaker/session、标签与时间来源。source phones、derived event、book IPA、model prediction 四类分开；标签 `present/absent/unknown`，unknown 不进负例与监督 loss。

维护两种集合：

- **冻结回归集**：现有 1,600/600/600 和所有已曝光外部录音；原始六底座结果不变。
- **后续开发/最终测试集**：仅在现有专业材料中寻找未受旧训练/选择污染的说话者/session/录音组。按 exposure ledger 检查；旧样本没有入选 2,800 条不代表所在说话者未曝光。无法组成足够独立组时，保留研究/回归结果，发布 gate 为“数据不足”。

分组划分顺序：先去重/关联父录音 → 分 speaker/session → train/dev-selection/dev-calibration/test → 再裁片和增强。阈值、校准、候选参数不得利用最终 test。相同基线版本的 test 不拿来反复选择 E1/E2/E3；先在 dev 选择一个发布候选，再评估封存 test。

自然分布评测按预先固定的完整录音或完整会话范围取样，不按类别均衡。报告其实际语料和基础率，称为“该源域自然分布”，不直接称为 Libitu 全部真实使用分布。

**召回分母必须独立于模型生成的候选。** 由参考转录和可信专业源标签构建固定机会集合；无法可靠判定的项单列 unknown。候选生成漏掉的可确认正例、对齐失败的正例、被拒识的正例，都计入端到端 FN。不得只在检测器自己找到的候选上算 recall。

Precision 为已判定检测中的 TP/(TP+FP)。若预测阳性落在 unknown 标签区间，另外报告未裁决阳性数量与比例及保守界限，不能排除后宣称全域 precision。Coverage、标签可判率分别报告，避免模型可判覆盖与参考标签完整度混在一起。

## 6. E0b：先拆开误差，再决定训练

四个固定 checkpoint：WavLM Large、原始 Wav2Vec2 Large、WavLM Base+、Whisper Small encoder。HuBERT/data2vec 历史结果仍保留，第一轮不追加全量矩阵。公共候选/对齐只计算一次，各模型使用同一候选清单；编码器特有预处理、层选择和时间映射分别固定。

E0b 在 dev/既有 regression 上用于诊断，不消耗未来发布 test。先用固定的少量开发录音完成加载、输出和耗时 smoke，再生成全量运行预算；不购买算力或偷偷减少必测对照。

| 轨道 | 候选与定位 | 分类器 | 解释 |
|---|---|---|---|
| A：冻结基线 | 原源标注候选/窗口 | 原冻结头 | 核对旧结果 |
| B：预测定位 | 同一参考候选，改用可部署定位 | 同一冻结头 | 对比 A，只研究边界变化；源候选仅作诊断，不称端到端 |
| C：完整流程 | 只用转录/词典生成候选 + 预测定位 | 同一冻结头，阈值已固定 | 计入候选漏失，测完整链路 |
| D：鲁棒性 | C 加固定压力变体 | 同一冻结头 | 合成噪声/混响/编码分别报告，与原片同组 |

C 不读取 surface labels 选择候选或发音变体；评估器可在预测结束后用源标签匹配评分。1 秒窗的源采样坐标、边缘 padding、定位误差、词位锚点都记录，不能只保留裁片后的相对坐标。

首发参考音使用冻结参考转录输入；转录来自专业原文与来自产品字幕的情况分开。参考转录已知的实验不证明 ASR 准确率。对齐器需允许目标音替代/缺失的诊断，不把强制词典音实现当作证据；错句/覆盖不足须拒识。

喉塞/删除等若有可靠源监督，可作非闪音对照；静音、噪声、严重错句优先进入质量拒识，而不是一律作为普通“未发生闪音”的训练负类。可判域之外输出 unsupported/insufficient_evidence。

E0b 产物：四底座 A/B/C/D 结果、候选召回、定位成功率、P/R/F1/AP、每分钟 FP、拒识和 coverage、按语料/说话者/信道切片、错误样例及 compute.json。性能报告包含 warm/cold、解码/对齐/encoder/head/总耗时和硬件，离线批处理耗时不代替部署 P95。

## 7. 错误审计、D1 与有限训练

错误审计最多取 50 FP + 50 FN，少于该数量时全部纳入，不重复凑数；用于定位问题，不估计总体标签错误率。另从完整开发机会集合分层抽样，检查模型判对和判错项的来源/关联/边界质量；记录抽样概率与覆盖。仅靠文档、IPA 或模型输出无法裁决的条目标 uncertain，不擅自修改专业标签。

标签修订仅限可追溯的工程错误（错误关联、重复、解码、明确字符解析等），原值保留，生成新数据版本；声学争议在没有独立可信依据时留 unknown。已有专业数据没有新独立裁决时，报告名用 `label-audit.md`，不声称测得“标注上限”。

| D1 诊断 | 下一步 |
|---|---|
| 样本身份/标签关联错误 | 修复构建并版本化，重新审计 |
| 候选遗漏/对齐失效造成主要下降 | 先做候选/定位的单变量修复，固定编码器 |
| 有可信监督且分类残差明显 | 进入 E1 小预算试验 |
| E1 的 dev 改善不足，仍有可靠声学残差 | 在预算固定后比较 E2 与 E3 |
| 新测试域/独立组/可信标签不足 | 允许研究与最小工程整理；暂不进入发布 |
| 运行成本不可接受 | 优先测 Base+ / 调整推理实现；任何优化作为新版本回归 |

不把 0.80 precision 下界/0.80 定位召回作为迁移条件，不以“模型真错 ≥50%”决定能否学习。D1 是对后续实验的选择，不是根据旧测试集宣布赢家。

E1 起始协议：保留同一候选/pooling/训练归一化，linear 对照与一层 128-unit MLP（dropout 0.1），配对三种子；首轮沿用 400 更新/每 40 步 dev 评估，以便与原预算对照。这些为新实验起始配置，不是已证明最优值。预测边界训练与源边界训练须分 arm，不能与换头同时混为一个收益。

E2 起始搜索范围为顶部 2/4 层解冻；E3 起始范围为 attention Q/V 的 LoRA rank 4/8。先检查实际模块名、可训练参数、梯度路径与导出重载，不能假定通用 LoRA 示例适配 WavLM。两者使用同一头/初始化来源、相同数据顺序/增强/种子和预注册调参次数；encoder/head 学习率分开。最大更新数、学习率候选、早停、硬件与预计计算预算在 E0b/D1 后写入配置冻结，缺任一项禁止启动，不能边看 test 边调。

E1–E3 先以 dev 表现和成本筛选至最多两个底座；原始 Wav2Vec2 的 E0b 对照始终保留。若最终只训练一个底座，明确理由，不能将不同训练预算结果解释为纯底座能力差异。数据增强先做独立消融，测试变体继承父录音 split。

## 8. 实验档案与运行恢复

`store/runs/<run-id>` 是权威档案，包含配置、数据/模型锁、环境、代码快照、状态/事件、逐条预测、指标、选择记录、checkpoint、哈希清单。MLflow 从这里同步，失败可重试/重建，不反向改写实验结果。

实现最小可靠机制：单 run 单写者锁、状态原子替换、更新时刻、attempt_id、内容校验与分片恢复。运行时可用本机进程身份辅助判断；进程消失且没有结果 seal 时标 interrupted/unknown，不仅凭 PID 或旧 status 宣称完成。恢复任务校验完整 protocol/model/data/preprocessing 哈希；权威终态要求最终 artifact manifest 存在且哈希通过。

恢复 feature extraction 可复用已校验分片；恢复训练需要 optimizer/scheduler/RNG/sampler 状态。若缺状态，启动新 run 并关联旧 run，不能标记为精确续训。完成后的核心 artifacts 不覆写，补充分析建立关联记录。暂不做多机锁、集群队列或复杂调度平台。

## 9. 发布门槛与未支持能力

首发候选能力：**已验证参考录音域、指定词典环境中的 flap/tap 检测**。并非所有参考音、所有母语者或所有 GA 场景；源角色与人口/口音标签分别记录。学习者域保持 unsupported，待以后具备专业证据再立独立任务；不追加用户标注任务。

建议沿用以下 Gate A 数值，在正式上线实验前写入 release-gates.yaml；本次规划不表示已达成：

- Precision ≥0.90，按说话者/session 聚类的预注册 95% 区间下界 ≥0.85。
- Recall ≥0.70，分母为固定可确认 eligible 正例；候选遗漏、定位失败、拒识正例全部计 FN。
- 可判覆盖 ≥0.50，未知参考标签比例、未裁决阳性、每分钟 FP 分开披露；不通过减少机会集合美化指标。
- 100 正例/20 说话者仅为样本规划起点，还需阴性环境、预测阳性数量、会话多样性及区间精度；不足时写 data-insufficient，不称通过或统计证明不可能。
- test 只用于锁定候选验收，校准在 dev-calibration。学习者未来也必须遵循该隔离，不能让同一批样本同时调阈值和做独立验收。
- 源时间分辨率限制定位声明；首发给词/候选窗口。Buckeye 标签不用于证明 20 ms 真实边界精度。
- 目标硬件实测 5/15/30 秒音频、冷/热启动、并发和内存。10 秒热启动 P95 ≤3 秒是初始工程目标，未实测不承诺。
- 版本重载、失败/重试、删除后晚到结果、回滚、业务隔离通过。

同化 222/1,154、融合 25/66 是现有保守派生正负例清点，不是独立事件金标量。融合验证集无可靠正例，两类本轮只审计；不凭整体数量生成可上线分类头。IPA 为独立任务，既非现象检测前置条件，也不把窄式符号输出当事件准确率。

概率校准同样是拟合过程，应使用与模型拟合分离的数据；最终 test 再独立于二者。参考：[scikit-learn 概率校准文档](https://scikit-learn.org/stable/modules/calibration.html)。

## 10. 服务候选归属、映射与业务状态

稳定后数据流：Libitu API → 独立 Sound evidence job → 内部推理服务 → Libitu 校验/持久化 → 页面。研究服务不访问业务数据库，不管理用户，不生成教学文案。Libitu 不加载训练 runtime，不以模型故障阻断现有词匹配/韵律结果。

服务拥有检测候选策略，并将**同一候选实现与版本**用于训练构建和推理。Libitu 保留覆盖 12 类的文本教学提示，两者不是必须逐项相等的集合：教学提示可以宽于音频检测能力。

输入契约包含音频身份/hash、受控内容、reference/learner 角色、transcript 及 hash、请求子类、候选策略版本。服务输出自己生成的候选、定位来源/质量、audio identity、model release、evidence schema、校准版本及逐项结果。

词位映射通过原始 transcript 的稳定字符范围、文本 hash 和 tokenization version 完成；跨 JS/Python 明确 UTF-16 offset，phone/word/boundary 坐标分别定义。服务 token ID 不直接当 Libitu token index。

- 映射成功：将声学证据关联至词位/边界，即使业务规则没有同名提示，也保留结果。
- 策略覆盖不同：记录差异和能力范围，不自动认定任一侧错误。
- 映射失败：证据原样保存，单列 `mapping_status=unresolved` / reason；UI 不把它贴到猜测词位上。显示证据未关联提示，不能修改检测结果来伪装为声学不足。

音频事件保持 detected/not_detected/insufficient_evidence/unsupported；作业 failed/unavailable 与映射状态另分维度。not_detected 仅限有可靠负判能力的可判域，不等于发音错误；可选 GA 变体缺失不扣分。参考音与用户音独立绑定，首发 learner 返回明确 unsupported。

发布包锁定模型、预处理、候选策略、对齐器、归一化、阈值/校准和 capability。生产使用不可变 release ID；shadow → 按场景/子类灰度 → 正式开放。shadow 无金标时只能测延迟/失败/映射等运营指标，不能据此宣布检测 precision 达标。历史结果保留原版本，回滚不改写旧 evidence。

## 11. 工作包、验收与停止条件

| 顺序 | 工作包 | 必须交付 | 验收/下一步 |
|---|---|---|---|
| P0 | 保全与可恢复性 | inventory、源码/环境快照、哈希、备份状态、恢复记录 | 不可替代数据无丢失；备份不足则禁止清理原件 |
| P1 | 最小拆分 + E0a | 独立包/环境、资源解析、研究测试迁移、基线核对、路径映射 | 无 Libitu 源码可运行；重评分一致；业务回归通过 |
| P2 | E0b 与数据审计 | 四底座 A/B/C/D、自然分布/unknown/exposure 清单、错误分析、成本表 | 明确候选/定位/分类损失；发布 holdout 不受污染 |
| D1 | 确定下一实验 | 决策记录、问题排序、冻结预算 | 修数据/定位或进 E1；数据不足则不发布 |
| P3 | 按需整理与追踪 | 模块依赖检查、统一 CLI、MLflow 同步、规范报告 | 可离线复核；不为平台建设延误关键实验 |
| P4 | 有限训练 | E1 及有依据的 E2/E3、配对种子、误差/成本结果 | dev 选择、独立 test 验收；未改善保留基线 |
| P5 | 服务与集成 | release/contract/runtime、Libitu client/job、shadow/灰度/回滚证据 | Gate A 与工程验收通过才开放参考音检测 |

P0/P1 不取决于 E0b 分数。P4 的训练配置与计算预算必须齐全再运行。P5 必须依赖实际目标域证据，不因代码能启动就算上线完成。学习者与其他现象不加入首发范围。

常规 CI：轻量 fixtures、数据规则、schema/导入边界，不下载模型或长训练。模型 smoke、完整评测独立触发。Libitu 结构迁移跑根 lint/build/test；服务集成再做真实录音任务流程、超时/删除/重试以及桌面/手机展示验收。恢复旧数字与测试通过分别报告，不把 fixture 验收写成真实设备/模型质量验收。

执行时更新 Libitu 的 PROJECT/TASK/DECISIONS 和旧报告指路；研究仓库的 docs/decisions 记录模型与实验决策。当前仅新增这份统一方案，没有修改业务行为。

## 12. 本次复核依据

- 研究文件/测试数量与导入依赖：当前 `apps/api/scripts/sound_pilot`、`apps/api/tests`。
- 源窗口中心：[event_corpus.py](../../apps/api/scripts/sound_pilot/event_corpus.py) 的 `(start + end) / 2` 与固定 1 秒裁剪。
- WavLM/Wav2Vec2 配对区间：[PAIRED-COMPARISON.json](../../.cache/sound-pilot/events-ssl-v2-20261110/PAIRED-COMPARISON.json)。
- Whisper 测试批次耗时：[test/index.json](../../.cache/sound-pilot/events-extra-v3-20261110/features/whisper-small-encoder/test/index.json)。
- data2vec 测试批次耗时：[test/index.json](../../.cache/sound-pilot/events-extra-v3-20261110/features/data2vec-audio-large/test/index.json)。
- 数据来源和保守派生数量：[原始事件报告](../benchmarks/sound-events-20261109/REPORT.md)。
