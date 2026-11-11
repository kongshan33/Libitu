# Stage 2 Sound：GA 执行方案

日期：2026-11-07。状态：P0–P5 已完成本地实现与验证；[交付记录](../benchmarks/stage-two-ga-sound-20261107/REPORT.md)列出测试、桌面／手机浏览器验收及证据边界。

用户决定第一阶段只支持 General American（GA，标准美音）。本文件确定 Sound 的分类、标识、条件式提示、兼容方式与验收边界。2026-11-07 最新用户要求及 html-2 / v2.1 设计规范覆盖初次交付的元音测量展示与双份候选样式；见 [更新验收](../benchmarks/stage-two-ga-sound-20261107/READING-CUES.md)。实施状态由 `PROJECT.MD`、`TASK.MD` 记录。

## 1. 交付范围

- 学习目标固定为 GA；界面显示 `Learning target · General American`，不增加口音切换器。
- 四组、12 个一级筛选项，另有 All。T/D drop、H-drop 是 Elision 子类。
- Detailed 与 Review 共用分类、标识、子类、空状态及解释；保留各自的文本流／时间轴容器。
- 提供保守的文本／词典候选，明确适用条件与替代读法；不要求学习者使用每一种可选音变。
- Vowel length 展示词尾清浊条件下的相对元音长短提示；Sound 不再展示时长测量面板。既有声学字段与历史适配器保留。
- 本轮交付不以新增声学现象识别器为前提。真实实现的自动识别属于后续 M4b，不能把本轮完成写成检测器交付。

GA 是提示所用的学习目标，不是对原音说话人口音的识别结果。原音口音未知时仍可听录、查看测量和阅读 GA 条件式提示；不能把非 GA 原音强行解释为 GA，也不能因合理的口音变体判错。

移除独立 R-linking／Intrusive R 项。GA 中词典本有的 /r/ 与后续元音的连接归入 Linking；不从 `law and order` 等文本生成 intrusive R 提示。不为凑足 13 项新增另一项。

## 2. 实施前基线（历史记录）

| 位置 | 2026-11-07 实施前核对结果 |
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
| Vowel | `vowel_length` | `ː Vowel length` | 元音相对长度 | 同一元音在清辅音前较短、对应浊辅音前较长；条件提示，不是测量或音质判断 |

一级数量为 3 + 3 + 5 + 1 = 12。所有一级入口都可查看说明；“存在该入口”不代表自动提示或检测已覆盖其所有子类。

Elision 展开 `All elision / T–D / H / Other`。当前 UI 仅 Elision 显示二级筛选，其他 subtype 保留在数据与解释中；切换一级时重置为该类 All。未覆盖子类可以查看说明，但必须显示 `Suggestions for this subtype are not available yet.`，不能伪装成零次发生。

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
| Vowel length | 全部词典读音一致的主重读元音紧邻单个词尾清／浊阻碍音；显示相对 shorter / longer | 未知、相关音／重音有歧义、非重读、复杂尾辅音及响音不生成候选；不消费测量值 |

实施时每条新增词项／模版必须附正例、反例、条件和语言学依据；不满足这四项就保持说明可用、候选未支持。规则覆盖与声学检测覆盖分开统计。

送气／不送气、暗 L、L 元音化、鼻化、R 音色、yod-dropping、-ing 变体及元音音质对比进入折叠的 GA 发音说明。本轮不新增这些一级 chip，也不声称它们不重要或必然发生。重音、节奏、语调继续由 Rhythm／Melody 承载。

## 4. 标记、去重与解释

- `∅` 表示省略；禁止用 IPA 元音 `ø` 代替。
- 使用 tʃ/dʒ 或带结合弧的 t͡ʃ/d͡ʒ；弃用旧连字 ʧ/ʤ。
- `≈`、`◐`、`’` 是 UI 类别图标，不能出现在音标串中冒充 IPA。
- `ː` 是 Vowel length 类别图标。在音标里仍只表示长音，不能由绝对毫秒阈值自动追加。
- `/ /` 表示音位／词典参考，`[ ]` 表示实现形式；候选的 `[ɾ]` 仍必须写“可能读作”。
- 连读统一使用筛选框同款 `‿` 下弧线；作为独立按钮，在词流／时间轴下方打开该边界的解释卡；变化用局部 phone 提示，如 n→m；省音用 t→∅／h→∅；缩约括住整段短语；成音节用 n̩/l̩；元音相对长度用 `shorter` / `longer`。
- 有准确音素锚点时显示对应音素；只有词典和词跨度时锚定词／词间边界，并在卡片展示局部音变。不得把某个字母强行当作已对齐音素。
- 同一 d+j 融合事件默认只显示 Coalescence，详情说明它属于同化；T/D tap 不再叠加 Voicing change。
- 不同位置的不同事件可以并存，例如 button 的声门化与成音节辅音；同一 /t/ 的保持、闪音、声门替代、省略若是备选，必须作为替代读法分组，不能画成同时发生。
- `All` 每个词位最多露出两个类别标记，其余以独立的 `+N` 按钮展开到解释卡的完整类别列表，再次点击收起；同类候选不重复占名额，但详情保留所有候选。连读弧单独占边界。优先具体音变／缩约，其次一般弱读／同化提示。同一事件去重后计数；候选数量不是实际发生次数。
- 解释卡固定包含：原文位置、词典参考、可能读法、适用条件、听辨提示、跟读提示、证据来源。有效的未弱化读法不标错误。

## 5. 证据状态与界面

| 状态 | 呈现 | 允许的结论 |
|---|---|---|
| 文本规则候选 | 实心浅色标记，块标题写 `Possible reading · GA conditions` | GA 条件下可能这样读 |
| 已确认实现（后续） | `Confirmed`，附人工／检测器来源 | 仅允许经过评估的独立证据；本轮不出现 |
| 未检查／证据不足 | `Not checked in your recording yet.` | 未得出发生或未发生的结论 |

按用户后续浏览器反馈，文本候选恢复 Reference / Your voice 两行：前者为参考读法提示，后者为同一原文的练习目标，均不代表录音中已检测到的现象。不使用虚线或问号；颜色表示类别，状态文字表示证据。筛选计数不因双行重复翻倍；解释卡跟随所选行，隐藏／逐词揭示在两行同步。遮盖块按同一字体下的原词实际宽度显示，不使用固定宽度或统一省略号；按钮仍保留移动端触控面积。旧 take 缺少参考分析时如实提示，不以当前参考音源就绪替代旧 take 的证据。Sound 不再展示元音毫秒面板，既有声学结果不删除或重分析。

筛选与布局：

- `All` 加四个带组名的筛选组；选中黑底白字。现有现象颜色继续辅助识别，新增色不得替代符号／文字／证据状态。
- 桌面优先整组换行；组本身超过屏宽时允许组内换行。不得以整组不可拆导致手机横向溢出。
- 选中某类后只将其他装饰标记／弧线降到 20%；正文、状态、说明保持可读。悬停、聚焦或展开弧线时仍保持 20%；解释卡中的类别列表和说明保持正常可读。
- 切换筛选保留正文词序和身份、不启停媒体、不请求重新分析。2026-11-07 后续样式要求按用户提供的 Detailed 设计稿采用自然词宽；子类内容和标记宽度变化时允许自然重排，不再用固定词格与隐藏内容占位锁定坐标。两种视图共用选择规则。
- All 包含 Vowel length 条件提示。chip 显示类别色点、符号、名称与去重候选数；0 仍可选。解释卡紧贴词流／时间轴下方，七项内容使用桌面两列、手机单列。
- Notes 延续折叠容器；IPA 使用能正确显示组合附标的字体后备。图标、空状态、子类、解释、tooltip 和可访问名称都必须服从隐藏文字状态。
- 字体、按钮和可访问交互沿用现行项目规范；最新 v2.1 规范要求标记、IPA、次要注释、正文和控件都使用共享 Inter / `--font-ui`。颜色之外保留完整类别名，键盘／触屏均可访问详情。

空状态按原因区分：

| 情况 | 英文文案 |
|---|---|
| 受支持规则没有返回候选 | `No suggestions of this type were found for this sentence.` |
| 子类规则未支持 | `Suggestions for this subtype are not available yet.` |
| 实际发音尚未检查 | `This sound has not been checked in the recording.` |
| 尚无对应录音 | `No recording is available for this sentence.` |

候选为空与音频未检查可以同时成立；分别呈现，不能合并为 `No X in this sentence`。

## 6. 元音相对长度（用户最新定义）

同一元音在相似重音、语速与短语位置下，在词尾清阻碍音前通常比对应浊阻碍音前短。使用 bit/bid、beat/bead 等配对解释；不把 ship/sheep 的音质区别简化成长度，不因浊辅音部分清化便否定条件规律。

v3 规则要求每个词典变体的主重读元音、词尾阻碍音与 phone 位置一致。清音集合 P/T/K/F/TH/S/SH/CH，浊音集合 B/D/G/V/DH/Z/ZH/JH。不覆盖复杂尾辅音、非重读元音、开放音节或未知读音。标签用 shorter / longer，解释列出比较条件；不创造 IPA 长度附标、精确毫秒或音质结论。

没有参考录音仍可查看。历史 phone 时长、词内汇总与语速因子继续由现有只读适配器保留，但不生成 Sound 候选，也不出现在 Vowel length UI。既有评分和历史数据不改写。

## 7. 数据与兼容

- 升级派生 guide 为 `sound-rules-v3`，保留 v1/v2 读取兼容。服务端继续从 content/sentence 取原文，客户端继续核对完整文字、UTF-16 token offsets 与独占末端跨度。
- `dialect: en-US` 保留，并在 v2 明确 `target_accent: GA`；该字段不表示原音口音。无需数据库口音字段或切换器。
- 共享类型包含 12 类文本候选；v3 才接受 vowel_length 候选。旧 v1/v2 和声学 assessment 不升级为新的长度提示。
- v2 候选增加受限的 subtype、词／边界／音素锚点与可选 alternative-group 标识。候选继续仅为 candidate；音频观察与测量通过独立 evidence 对象关联准确的 voice/take/reference，不能在同一字段混用。
- UI 词典元数据由 `sound/phenomena.ts` 集中管理；TS union 与 Python Literal 用契约检查保持一致，不为此引入跨语言代码生成框架。
- 旧 `drop_d` → `elision / td_drop`；旧 `h_drop` → `elision / h_drop`；`flap`、`weak_form`、`vowel_length`、`voicing` 保留 kind。兼容映射只调整展示，不提升证据等级。
- 旧 assimilation 只有 rule_id 明确为现有 coalescence 规则时才迁入 Coalescence；未知来源保留一般同化，不靠描述文案猜。
- 保留旧总时长字段的消费兼容，独立元音列表留作数据兼容。对历史声学结果和旧评分不原地改写。
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

P1 → P2 → P3 → P4 → P5 初次交付已完成；P0 当时仅为范围落档。表中 P4 时长展示是初版历史状态，现由第 6 节元音长度提示覆盖。当前交付为 GA 条件式学习提示，不包含后续检测器。

必须覆盖的验收场景：

- water/ladder 的候选归 T/D tap；stop/school 不产生浊化误导。
- did you 的融合迁入 Coalescence，All 不重复显示同化标签。
- next day 的省音是候选；stop talking 的不可闻释放不被归为省音。
- tell him 的 H-drop 保留非重读／短语条件，实词 h 与词典静音字母不滥标。
- button 的声门化／成音节辅音可解释；互斥 /t/ 实现不能同时冒充观察结果。
- law and order 不出现 intrusive R 提示；已知词尾 /r/＋元音可有普通 Linking。
- 显式 gonna 的缩约解释与普通 going to 的语法歧义分开。
- 13/15 项旧提案不再混入新入口；12 类之外的知识通过 GA 说明进入。
- bit/bid、beat/bead 显示较短／较长条件；无参考音频可用；旧时长值不产生新提示。多元音／历史总值适配器兼容保留。
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


## 11. v2 实施核对记录

以下是有限条件规则的实现范围，不是对任一录音的观察。词项／模板逐项核对了资料与正反例；尚无独立语音学专家听审或学习效果实验。规则对应 `test_sound.py` 的参数化用例；每条输出携带条件与来源。

| 规则／词项 | 正例 | 反例／边界 | 实现条件与依据 |
|---|---|---|---|
| C–V、同辅音、j/w 过渡 | red apple；big game；go away | red, apple；use apple；go, away | 同短语，相关边界音在全部词典变体中一致；[连贯语流教学](https://iastate.pressbooks.pub/teachingpronunciation/chapter/chapter-10-connected-speech/) |
| t/d/s/z + you/your 融合 | did you；got you；miss you；as you | red yacht；got, you；use you | 代词非重读；保留分别发音的可能；[连贯语流教学](https://iastate.pressbooks.pub/teachingpronunciation/chapter/chapter-10-connected-speech/) |
| n 的部位同化 | ten boys；ten cars | ten, boys | n 后接 p/b/m 或 k/g；[连贯语流概述](https://opentextbooks.rug.nl/americanenglishphonetics2/chapter/13-1-connected-speech/) |
| 功能词弱读 | we chose a plan；we went to school | a plan；a can；强调／引用；未知后词 | a/an/and/of/to/the，保留原有语法与非重读条件；[连贯语流教学](https://iastate.pressbooks.pub/teachingpronunciation/chapter/chapter-10-connected-speech/) |
| 显式缩约 | I'm、I'll、we'll、you'll、can't、don't、we're、they're；gonna、wanna | going to school 不自动改写 | 仅说明原文已写出的形式及语法含义；[连贯语流教学](https://iastate.pressbooks.pub/teachingpronunciation/chapter/chapter-10-connected-speech/) |
| t/d 省音 | best boy；next day；last week | red boy；best apple；stop talking | C+t/d+C；last/next 的词典完整／省略变体是明示备选；[连贯语流概述](https://opentextbooks.rug.nl/americanenglishphonetics2/chapter/13-1-connected-speech/) |
| h 省音 | tell him；we have | he left；tell, him；Henry；honest | he/him/his/her/have/has/had，非短语起始、非重读代词／助动词；[连贯语流教学](https://iastate.pressbooks.pub/teachingpronunciation/chapter/chapter-10-connected-speech/) |
| 词内 T/D tap | water；ladder；better | attack；retail；at ease | 主重读元音—t/d—非重读元音，单一完整词典读音；[冠音弱化研究](https://sail.usc.edu/span/pdfs/parrell2018explaining.pdf) |
| 声门替代／加强 | button；cotton；mountain | water；cup | 有限词项的 t+弱音节 n；同一 t 的 tap／声门两种实现共用替代组；[GA 鼻音及声门化](https://opentextbooks.rug.nl/americanenglishphonetics2/chapter/9-3-2-nasalization-and-nasal-deletion/) |
| 不可闻释放 | stop talking；词内 stop+stop | 不据此生成 elision | 重叠闭塞可掩盖释放；[塞音簇释放](https://opentextbooks.rug.nl/americanenglishphonetics2/chapter/10-2-incomplete-plosion-of-stop-clusters/) |
| 成音节辅音 | button/cotton/mountain；bottle/little | 不扩展任意 ə+n/l 或 m̩ | 所有词典变体的弱尾音节一致，独立于 t 实现；[GA 鼻音](https://opentextbooks.rug.nl/americanenglishphonetics2/chapter/9-3-2-nasalization-and-nasal-deletion/)、[GA /l/](https://opentextbooks.rug.nl/americanenglishphonetics2/chapter/12-3-1-approximants-l/) |
| 义务结构清化 | have to；has to | stop/school；have, to | 义务含义且无强调／短语边界，不推广一般清浊规则；[Roach：语流与协同发音](https://www.personal.rdg.ac.uk/~llsroach/phon2/asscoareli-into.htm) |

多读音策略的限定：保留所有显示变体，不选取第一读音代表录音；只使用全部变体一致的相关边界，或上述 last/next 有限替代对。超过四个变体而被截断时，不从显示子集推断边界共识。未知词继续不猜。未覆盖子类显示不支持提示。

历史 `vowel_length` assessment 仅保留数据适配兼容；不进入当前 Sound UI，不由总值拆出 phone，不作为清浊条件候选。原始 phone 标签仍是强制对齐标签，不是音质识别。

## 12. v3 元音长度规则核对

正例 bit/bid、beat/bead、cap/cab、back/bag、safe/save、face/phase、rich/ridge、about/indeed；反例 water、bottle、banana、bee、all、next、act、read、live、A、XYZ。另验 beat up / bead shop 的后词不改变词内条件、safe / save 依据尾音而非字母 e。

语言学依据：[Coretta 博士论文的 voicing effect 综述](https://stefanocoretta.github.io/phd-thesis/s-ve.html)说明前元音长度与后续阻碍音清浊的关系，以及重音／语速／韵律的影响；[UCL Wells 语音学讲义](https://www.phon.ucl.ac.uk/home/wells/p201-3-lecture-new.pdf)的 pre-fortis clipping 提供教学参照。上述受限规则是本项目实现边界，未声称覆盖全部环境或验证学习效果。
