# Stage 2 Sound：GA 执行方案

日期：2026-11-07。状态：范围与执行方案已确定；下述产品改动尚未实现。

用户决定第一阶段只支持 General American（GA，标准美音）。本文件确定下一轮 Sound 的分类、标识、条件式提示、时长展示、兼容方式与验收边界。实施状态由 `PROJECT.MD`、`TASK.MD` 记录。

## 1. 交付范围

- 学习目标固定为 GA；界面显示 `Learning target · General American`，不增加口音切换器。
- 四组、12 个一级筛选项，另有 All。T/D drop、H-drop 是 Elision 子类。
- Detailed 与 Review 共用分类、标识、子类、空状态及解释；保留各自的文本流／时间轴容器。
- 提供保守的文本／词典候选，明确适用条件与替代读法；不要求学习者使用每一种可选音变。
- 展示已有对齐证据支持的单元音时长，以及明确命名的历史词内元音总时长。
- 本轮交付不以新增声学现象识别器为前提。真实实现的自动识别属于后续 M4b，不能把本轮完成写成检测器交付。

GA 是提示所用的学习目标，不是对原音说话人口音的识别结果。原音口音未知时仍可听录、查看测量和阅读 GA 条件式提示；不能把非 GA 原音强行解释为 GA，也不能因合理的口音变体判错。

移除独立 R-linking／Intrusive R 项。GA 中词典本有的 /r/ 与后续元音的连接归入 Linking；不从 `law and order` 等文本生成 intrusive R 提示。不为凑足 13 项新增另一项。

## 2. 当前实现基线

| 位置 | 2026-11-07 核对结果 |
|---|---|
| `apps/web/features/stage-two/sound/phenomena.ts` | 10 个筛选项；含独立 Drop-D、H-drop，尚无本方案的 Coalescence、Reduced forms、Unreleased、Syllabic |
| `apps/api/app/services/sound_service.py` | `sound-rules-v1`；词典与确定性规则；5 类候选；Coalescence 目前借用 assimilation kind |
| `apps/api/app/schemas/sound.py`、`packages/types/src/stage-two.ts` | 固定 en-US；候选与实际音频证据分离 |
| `apps/web/features/stage-two/comparison/view.ts` | 将词内对齐元音时长求和为 `vowel`，前端尚未保留独立元音列表 |
| `apps/api/app/schemas/practice_analysis.py` | `AlignedPhone` 保存标签与时长；不能假定每个公开音素对象都有准确起止时间 |
| `apps/api/app/services/acoustics/comparison.py` | 既有元音总时长／边界停顿比较；不能判音质、闪音、省音或声门化 |
| `SoundCue.tsx` 与 Detailed／Review 消费者 | 已有共享标记组件；现行实线 Reference 候选样式需按下文改为统一证据状态 |

本轮沿用现有录音、历史 take、Reference 绑定、60/85 词匹配门槛、隐藏文字、权限、保留与删除契约。分类、提示和显示升级不增加上传，不改变分析用途，不请求新模型凭据。

## 3. 唯一分类与标识表

下表是产品导航，不宣称各行构成互斥的语言学分类。一级 kind 沿用能兼容的旧 ID；label 可以纠正术语。

| 组 | kind | 图标／英文标签 | 中文 | 子类与边界 |
|---|---|---|---|---|
| Connect | `linking` | `‿ Linking` | 连读 | C–V；V–V glide；same-consonant。分别解释，不能称为同一机制 |
| Connect | `coalescence` | `t͡ʃ Coalescence` | 融合同化 | /t,d,s,z/ + /j/ 的相关融合；具体事件显示 tʃ、dʒ、ʃ 或 ʒ |
| Connect | `assimilation` | `≈ Assimilation` | 同化 | 部位／方式同化；一级展示排除已归 Coalescence 或 Voicing change 的事件 |
| Reduce | `weak_form` | `ə Weakening` | 弱读 | 功能词弱读式与非重读元音弱化分开；不能把所有弱读等同于 ə |
| Reduce | `reduced_form` | `’ Reduced forms` | 缩约读法 | 常规缩约与口语缩约分开；受词汇／语法条件约束 |
| Reduce | `elision` | `∅ Elision` | 省音 | T/D drop、弱读功能词 H-drop、Other；不包含未爆破或声门替代 |
| Consonant | `flap` | `ɾ T/D tap` | T/D 闪音 | /t,d/ → [ɾ]；保留稳定 kind，改正 Flap-T 名称 |
| Consonant | `glottal` | `ʔ Glottalization` | 声门化 | 替代 [ʔ] 与加强如 [ʔt] 分开；GA 条件，非泛化英音规则 |
| Consonant | `unreleased` | `p̚ Unreleased` | 无可闻爆破 | 相关塞音释放不可闻；鼻腔／舌侧释放不直接等同于该子类 |
| Consonant | `syllabic` | `n̩ Syllabic` | 成音节辅音 | n̩、l̩、m̩ 等；不以拼写或零时长直接证明 |
| Consonant | `voicing` | `◐ Voicing change` | 清浊变化 | 浊化、清化；部分清化与完整替换分开；不包含不送气或已归 Tap 的事件 |
| Vowel | `vowel_length` | `ː Vowel duration` | 元音时长 | 测量入口；音质与时长分开，不输出“长短元音读对了”的判断 |

一级数量为 3 + 3 + 5 + 1 = 12。所有一级入口都可查看说明；“存在该入口”不代表自动提示或检测已覆盖其所有子类。

Elision 展开 `All elision / T–D / H / Other`。其他含子类的入口使用同样的二级筛选结构，切换一级时重置为该类 All。未覆盖子类可以查看说明，但必须显示 `Suggestions for this subtype are not available yet.`，不能伪装成零次发生。

### 3.1 本轮规则覆盖

继续采用词典与有版本的确定性规则，不新增 LLM 调用或为扩大覆盖而引入泛化语法分析器。每条候选都输出前后音、上下文条件、来源及局部位置；不把条件当成已经测出的重音或语体。

| 类别 | 本轮必须实现的候选范围 | 保守拒绝／暂缓范围 |
|---|---|---|
| Linking | 现有 C–V；已知相同边界辅音的连接；明确词典末音支持的 j/w 过渡提示 | 有标点／短语边界、未知／歧义读音不猜；V–V 解释为可能过渡，不要求额外重读 j/w |
| Coalescence | 将现有 t/d + you/your 正式迁入；补 s/z + you/your 的条件式候选 | 不把所有 palatalization 合并为 Coalescence；保留分开读的替代 |
| Assimilation | 明确边界的 n→m（后接 p/b/m）、n→ŋ（后接 k/ɡ）候选 | 不直接推断大范围方式变化、完全同化或任意清浊同化 |
| Weakening | 保留并核查当前功能词白名单；与 H-drop、成音节形式关联解释 | 词典本来的 ə 不自动算一次语流变化；can 等词类歧义、句子重音不猜；一般词内元音弱化先有说明，无泛化候选 |
| Reduced forms | 已显式写出的常规／口语缩约及人工审校的有限映射；标明“文本已给出该形式” | 不把所有 going to 替换为 gonna；无法核实语法用途的组合只作通用解释，不给位置候选 |
| Elision | 现有 C+t/d+C；非短语起始的弱读代词／助动词 H-drop 条件式提示 | 不把词典静音字母算语流省音；不推广到所有 h 开头实词；Other 先有说明，不扩大规则 |
| T/D tap | 保留词内重读元音—t/d—非重读元音规则，覆盖 t 和 d | 跨词及复杂重音环境暂缓；不把拼写 t 一律标 ɾ |
| Glottalization | button 等经逐条审校的 GA /t/＋弱音节鼻音环境候选，区分替代／加强 | 不给 water 等套用泛化英音声门替代规则；无可靠条件时只保留类别说明 |
| Unreleased | 已知塞音＋塞音组合的不可闻释放候选 | 不因声学上未发现 burst 生成“省音”；不把所有鼻／侧释放混入 |
| Syllabic | 经审校的有限词项／环境，如 button、bottle 的可选成音节读法 | 不把每个 ə+n/l 机械删除元音；复杂 m̩ 等子类先说明后扩展 |
| Voicing change | have to、has to 等有限、审校过且带语法条件的清化候选 | 不把 with 的词典变体当现场浊化；spin/stop/skin 不属于浊化；无独立浊化规则时如实显示该子类未支持 |
| Vowel duration | 消费实际保存的对齐标签／时长，不由文本生成测量值 | 不从总时长、字幕时间、单词长度补造音素区间 |

实施时每条新增词项／模版必须附正例、反例、条件和语言学依据；不满足这四项就保持说明可用、候选未支持。规则覆盖与声学检测覆盖分开统计。

送气／不送气、暗 L、L 元音化、鼻化、R 音色、yod-dropping、-ing 变体及元音音质对比进入折叠的 GA 发音说明。本轮不新增这些一级 chip，也不声称它们不重要或必然发生。重音、节奏、语调继续由 Rhythm／Melody 承载。

## 4. 标记、去重与解释

- `∅` 表示省略；禁止用 IPA 元音 `ø` 代替。
- 使用 tʃ/dʒ 或带结合弧的 t͡ʃ/d͡ʒ；弃用旧连字 ʧ/ʤ。
- `≈`、`◐`、`’` 是 UI 类别图标，不能出现在音标串中冒充 IPA。
- `ː` 是 Duration 入口图标。在音标里仍只表示长音，不能由绝对毫秒阈值自动追加。
- `/ /` 表示音位／词典参考，`[ ]` 表示实现形式；候选的 `[ɾ]` 仍必须写“可能读作”。
- 连读画在两个词之间的短弧；变化用局部 phone 提示，如 n→m；省音用 t→∅／h→∅；缩约括住整段短语；成音节用 n̩/l̩；时长用测量条。
- 有准确音素锚点时显示对应音素；只有词典和词跨度时锚定词／词间边界，并在卡片展示局部音变。不得把某个字母强行当作已对齐音素。
- 同一 d+j 融合事件默认只显示 Coalescence，详情说明它属于同化；T/D tap 不再叠加 Voicing change。
- 不同位置的不同事件可以并存，例如 button 的声门化与成音节辅音；同一 /t/ 的保持、闪音、声门替代、省略若是备选，必须作为替代读法分组，不能画成同时发生。
- `All` 每个词位最多露出两个类别标记，其余以 `+N` 展开；连读弧单独占边界。优先具体音变／缩约，其次一般弱读／同化提示。同一事件去重后计数；候选数量不是实际发生次数。
- 解释卡固定包含：原文位置、词典参考、可能读法／测量、适用条件、听辨提示、跟读提示、证据来源。有效的未弱化读法不标错误。

## 5. 证据状态与界面

| 状态 | 呈现 | 允许的结论 |
|---|---|---|
| 文本规则候选 | 虚线轮廓＋`Possible reading` | GA 条件下可能这样读 |
| 学习者练习目标 | 空心虚线＋`Practice target · not checked`；紧凑标记可保留 ? | 建议尝试；没有判断本次录音是否做到 |
| 音频测量 | 实际数值／时长条＋`Measured` 与来源／不确定性 | 测到了相应区间时长／间隔，不代表识别了音质或音变 |
| 已确认实现（后续） | 实线＋`Confirmed`，附人工／检测器来源 | 仅允许具有人工标注或通过评估的独立检测器证据 |
| 未检查／证据不足 | 文本状态与原因 | 未得出发生或未发生的结论 |

Reference 与 Your voice 使用同一证据语义。现行 Reference 文本候选实线样式在本计划实现时改为候选虚线；测量可实线，但必须带测量语义。本轮不会产生 Confirmed 发音标签，也不建设人工标注后台。

筛选与布局：

- `All` 加四个带组名的筛选组；选中黑底白字。现有现象颜色继续辅助识别，新增色不得替代符号／文字／证据状态。
- 桌面优先整组换行；组本身超过屏宽时允许组内换行。不得以整组不可拆导致手机横向溢出。
- 选中某类后只将其他装饰标记／弧线降到 20%；正文、状态、说明保持可读。聚焦或展开后恢复该项可读性。
- 切换筛选不改正文位置、不启停媒体、不请求重新分析。两种视图共用选择规则。
- All 显示发音提示；Duration 专门展示可靠的时长条／数值，All 不自动铺满 VL 数字。入口说明写 `All reading cues`，避免暗示包含所有测量。
- Notes 延续折叠容器；IPA 使用能正确显示组合附标的字体后备。图标、空状态、子类、解释、tooltip 和可访问名称都必须服从隐藏文字状态。
- 字体、按钮和可访问交互沿用现行项目规范；不用 mono 样式另起一套。颜色之外保留完整类别名，键盘／触屏均可访问详情。

空状态按原因区分：

| 情况 | 英文文案 |
|---|---|
| 受支持规则没有返回候选 | `No suggestions of this type were found for this sentence.` |
| 子类规则未支持 | `Suggestions for this subtype are not available yet.` |
| 实际发音尚未检查 | `This sound has not been checked in the recording.` |
| 时长证据不足 | `Vowel duration measurements are not available for these words.` |
| 尚无对应录音 | `No recording is available for this sentence.` |

候选为空与音频未检查可以同时成立；分别呈现，不能合并为 `No X in this sentence`。

## 6. 元音时长

1. 在 ComparisonView 保留元音条目列表：词位置、原始 phone 序号、对齐标签、duration、可用的质量／来源信息。不再只保留一个求和数值。
2. 音标名称明确为 `Aligned vowel label`，不是检测到的音质。若只有旧的词内总值，写 `Total vowel duration in this word`；不可冒充单个元音。
3. 只有双方词匹配、对齐有效且元音序列可对应时逐一并排比较。一个词有多个元音时按序号展示，绝不只比较总和后判断每个音。
4. 原始毫秒始终可见；可比较时另外展示采用既有可靠语速因子的调整值，并明确标注。语速、重音、句末位置与音质都可能影响时长，不设统一“正确长短”阈值。
5. 只有一方有测量时只显示该方；缺失为未知，不能填零或复制另一方。未匹配词保持现有 Sound 证据门槛。
6. 本轮复用已保存 phone 标签／duration，不改变旧分数公式、不新增 Sound 总分。现有两路比较分数也不能变成发音正确率。
7. 没有可靠音素起止时间时，时长条只是数值图，不当作时间轴定位；不由词起点与时长累加构造音素回放。可使用已有可靠词区间回放。
8. 不重分析历史音频；历史 phone 列表存在时可重建只读显示，只有汇总时退回明确的词级汇总，证据已删除时保持缺失。

ship/sheep、full/fool 的解释必须同时交代音质差异；bit/bid 等解释把元音时长作为辅音辨认线索之一，不写“尾辅音没了，所以只剩长度”。

## 7. 数据与兼容

- 升级派生 guide 为 `sound-rules-v2`，保留 v1 读取兼容。服务端继续从 content/sentence 取原文，客户端继续核对完整文字、UTF-16 token offsets 与独占末端跨度。
- `dialect: en-US` 保留，并在 v2 明确 `target_accent: GA`；该字段不表示原音口音。无需数据库口音字段或切换器。
- 共享类型区分 12 类 UI phenomenon 与可生成文本候选的 kind；Duration 属于测量入口，不能伪装为文本检测结果。
- v2 候选增加受限的 subtype、词／边界／音素锚点与可选 alternative-group 标识。候选继续仅为 candidate；音频观察与测量通过独立 evidence 对象关联准确的 voice/take/reference，不能在同一字段混用。
- UI 词典元数据由 `sound/phenomena.ts` 集中管理；TS union 与 Python Literal 用契约检查保持一致，不为此引入跨语言代码生成框架。
- 旧 `drop_d` → `elision / td_drop`；旧 `h_drop` → `elision / h_drop`；`flap`、`weak_form`、`vowel_length`、`voicing` 保留 kind。兼容映射只调整展示，不提升证据等级。
- 旧 assimilation 只有 rule_id 明确为现有 coalescence 规则时才迁入 Coalescence；未知来源保留一般同化，不靠描述文案猜。
- 保留旧总时长字段的消费兼容，新增元音列表供展示。对历史声学结果和旧评分不原地改写。
- 服务端缓存按规则／词典版本、目标、content/sentence/text 隔离；浏览器缓存包含规范化 schema／规则版本。保留现有取消、超时、LRU、重试和晚到响应拒绝。
- 继续限制 6,000 UTF-16、300 tokens、80 candidates。新增类别不得绕过限额；截断需明确报告，不能把已截断部分标成“没有现象”。

## 8. 实施顺序与验收

| 阶段 | 主要文件／工作 | 完成标准 |
|---|---|---|
| P0 范围落档（本次） | 本文件及 PROJECT/TASK/DECISIONS/设计规格/路线图 | GA、12 项、标识与证据边界明确；计划与实现状态分开 |
| P1 契约与兼容 | `packages/types/src/stage-two.ts`、API `schemas/sound.py`、Web `sound-api.ts`／`phenomena.ts` | 12 项注册、受限子类、v1/v2 解码、旧 kind 映射、版本缓存；非法跨度／证据不被接受 |
| P2 条件式提示 | `services/sound_service.py`、`tests/test_sound.py`、审校规则说明 | 覆盖第 3.1 节约定的有限规则；正反例、替代分组、重复去除与未知／歧义拒绝通过 |
| P3 两种视图 | `SoundComparison`、`SoundCue`、`LayerFocus`、Review 实际消费者及相应样式 | 分组筛选、子类、局部标记、说明、All 密度、证据样式、隐藏文字与空状态一致 |
| P4 时长显示 | `comparison/view.ts`、声学 API 消费类型、两视图时长详情 | 逐元音／历史汇总分开；单路、缺失、未匹配和多元音序列不误配；无伪造音素时间 |
| P5 回归与交付 | 规则／契约／适配器测试，浏览器检查，项目文档更新 | root lint/build/test 通过；1400px／390px、键盘／触屏、Detailed／Review 检查通过；记录实际证据与剩余覆盖 |

P1 → P2 → P3 → P4 → P5 顺序推进；P0 完成不代表任何 P1–P5 已交付。本轮完成定义是“GA Sound 学习提示与测量展示完整交付”，不包含后续检测器。

必须覆盖的验收场景：

- water/ladder 的候选归 T/D tap；stop/school 不产生浊化误导。
- did you 的融合迁入 Coalescence，All 不重复显示同化标签。
- next day 的省音是候选；stop talking 的不可闻释放不被归为省音。
- tell him 的 H-drop 保留非重读／短语条件，实词 h 与词典静音字母不滥标。
- button 的声门化／成音节辅音可解释；互斥 /t/ 实现不能同时冒充观察结果。
- law and order 不出现 intrusive R 提示；已知词尾 /r/＋元音可有普通 Linking。
- 显式 gonna 的缩约解释与普通 going to 的语法歧义分开。
- 13/15 项旧提案不再混入新入口；12 类之外的知识通过 GA 说明进入。
- 多元音词每个元音分别显示；历史总值正确命名；没有 phone 证据时不补造。
- 只有 learner、只有 reference、60–<85% 匹配、未知词、无可用测量、未支持子类均有准确状态。
- 切句／切历史 take／请求晚到／Reference 撤销或过期不会混用证据；重新打开不重分析旧录音。
- Hide text 不通过子类、tooltip、aria-label、解释卡泄漏词内容；筛选不触发播放／录音／新分析。
- Review 在 Fit／最小缩放不裁切弧线／附标，390px 无分组导致的横向溢出，键盘可读取全部标记。

新增测试聚焦以上行为与兼容边界，不为静态文案逐字复制实现。P0 文档变更只做链接、范围、状态和差异检查；代码阶段按仓库要求执行根检查。浏览器合成录音／fixture 验证交互，不替代真实发音评估。

## 9. 后续声学识别

独立推进 M4b：按现象建立有合法使用范围、人工标注且说话人隔离的 GA／学习者语音集；区分保留、无爆破、声门加强／替代、省音等反例。报告 precision、recall、abstention、coverage、标注一致性和不确定性，按反馈错误成本确定发布门槛。

没有验证前不显示 Confirmed、不标发音错误、不设 Sound 正确率。强制对齐拟合预期音素、短时长、无爆破、F0 中断、VAD 连续都不能单独完成现象判定。该工作延续既有 `STAGE_TWO_SOUND.md` 与声学 benchmark 的发布边界。

## 10. 依据

- [IPA 官方符号表](https://www.internationalphoneticassociation.org/content/full-ipa-chart)：音标与附标的规范。
- [John M. Levis / Kate Challis：Connected Speech](https://iastate.pressbooks.pub/teachingpronunciation/chapter/chapter-10-connected-speech/)：连贯语流的教学分类与多过程共现。
- [Broeders / Gussenhoven：送气分布](https://opentextbooks.rug.nl/americanenglishphonetics2/chapter/9-2-2-distribution-of-aspirated-stops/)：不送气不能直接解释成浊化。
- [Broeders / Gussenhoven：塞音释放重叠](https://opentextbooks.rug.nl/americanenglishphonetics2/chapter/10-2-incomplete-plosion-of-stop-clusters/)：不可闻释放与省音的区别。
- [USC：Duration](https://sail.usc.edu/~lgoldste/General_Phonetics/Prosody/duration.html)：音质、上下文及韵律对时长的影响。

以上资料支持语言学边界；12 项导航、界面密度、交付阶段与兼容策略是本项目的产品／工程决定。
