# libitu 设计规范 v2.0(统一版)

ElevenLabs 风格 · 合并 v1.1 与 Stage 3–5 页面 · 覆盖全部 10 个页面 · 2026-11-01

## 0. 这一版做了什么

- 一套规则覆盖全部页面:Landing、Stage 1 摄取、选段、Stage 2 跟读、Stage 3 Loadout、Stage 4 对话、Stage 5 报告、My learning、Practice history、Corpus。
- **导航改为三层:全局栏 / 流程栏 / 专注模式**(第 2 节),取代原来每页各画一套的顶栏。
- 统一颜色语义:紫色只表示「当前 / 已选中 / 已播放」。Stage 3 页面里的靛蓝色、描边卡片、黑色大卡片,改为本规范的样式。
- 统一选中表达、标签页与筛选 pill 的区别、状态文字、空状态和动效。
- 第 15 节是各页面的迁移清单。

## 1. 产品结构与页面清单

| 分区 | 步骤 | 页面 |
| --- | --- | --- |
| Practice | 1 Ingest | Stage 1 摄取(视频、逻辑流、转写、语料) |
| Practice | 2 Shadow | 选段 Choose a segment;Stage 2 跟读(专注模式) |
| Mission | 3 Loadout | Mission loadout |
| Mission | 4 Conversation | Stage 4 对话(专注模式) |
| Mission | 5 Report | Stage 5 任务报告 |
| Corpus | — | Corpus library |
| My learning | — | My learning、Practice history |
| 入口 | — | Landing(不属于任何分区) |

流程栏里只显示步骤名称(Ingest、Shadow、Loadout、Conversation、Report),不显示数字;每个分区只显示自己的步骤。文档和内部讨论仍可用 Stage 1–5 指代。

## 2. 导航系统(建议方案)

### 2.1 为什么要统一

现状有三套导航:Stage 1 / 2 页的顶栏中间是 Stage 胶囊,右边是 Corpus / My learning;Stage 3 页和旧版个人页是 Practice / Mission / Corpus / My learning;Stage 4 / 5 页的顶栏中间是 Stage 1–5 五个胶囊。

同一个位置在不同页面里表示不同层级,有时是「产品分区」,有时是「流程步骤」。用户无法建立稳定预期,也不知道从 Stage 2 怎么去 Mission。

**结论:不保留不一致。** 分区和步骤是两个层级的问题,拆成两条栏分别回答:「我在产品的哪个区域」和「我在这次练习的哪一步」。

### 2.2 三层结构

| 层 | 出现位置 | 内容 | 高度 |
| --- | --- | --- | --- |
| 全局栏 | 所有登录后的页面 | `libitu.` + Practice / Mission / Corpus / My learning + 头像 | 64px |
| 流程栏 | Practice、Mission 里的流程页(Stage 1–5) | 左:这次练习的标题;右:本分区的步骤 | 52px |
| 专注模式栏 | Stage 2 录音、Stage 4 实时对话 | logo + 标题 + 步骤 + 退出按钮,合并成一条 | 64px |

Landing 未登录:logo + How it works + Sign in;已登录:右侧改为 My learning + 头像。

### 2.3 全局栏

- 左:`libitu.`(紫色 600,点击回 Landing)+ 四个分区;右:32px 黑色圆形头像(白色首字母)。分区靠左排列,不居中。
- 分区 14px `--ink-3`;当前分区 = `--line-soft` 底 + `--ink` 500,全圆。不用黑底,不用紫色。
- 不在全局栏放视频标题、tagline、Stage 胶囊或操作按钮。Tagline `Make it your English.` 只出现在 Landing 和页脚。
- 归属:Practice history 属于 My learning;Stage 1 / 2 属于 Practice;Stage 3 / 4 / 5 属于 Mission。

### 2.4 流程栏

- 步骤胶囊只写名称,不带数字:当前 = 黑底白字;已完成 = 对勾 + 名称(`--ink-3`),可点击返回;未开始 = `--muted`,未解锁时不可跳。步骤之间用 14px 的 1px `--line-strong` 横线连接,顺序靠位置、对勾和连接线表达。
- Practice 显示 Ingest → Shadow;Mission 显示 Loadout → Conversation → Report。
- 黑底胶囊只用于「流程里的当前步骤」和「分段控件的当前项」;全局栏当前分区用浅灰底,两者不会混淆。
- 标题单行省略,最大 420px。
- 去掉数字的原因:分区已经把步骤分成两组,数字 1–5 要跨分区才有意义,而流程栏每次只显示其中一组。

### 2.5 专注模式

- 触发:录音中的 Stage 2、进行中的 Stage 4。隐藏四个分区,只留 logo、上下文、步骤和退出次按钮(`End mission` / `Back to segments`)。
- 点击 logo 或退出时提示「进度已保存」再离开。对话结束或暂停后恢复为普通流程栏。

### 2.6 窄屏(< 720px)

顶栏只留 logo 和头像;四个分区移到底部标签栏;流程栏变成一行:当前步骤名 + 进度小圆点(如 `Shadow ○ ●`),点开看全部步骤。

### 2.7 分区切换与 logo

- 点分区回到该分区最近的流程页;该分区没有进行中的内容时,回到它的入口列表。
- 从 Practice 去 Mission 的路径是页面内主按钮(如 Stage 2 结束后的 Start a mission),不放进全局栏。
- 点击 `libitu.` logo 回 Landing,已登录时 Landing 右侧显示 My learning + 头像。专注模式下点 logo 先提示「进度已保存」。

## 3. 设计原则

1. **安静**:近乎单色,白底黑字,靠留白和字号层级区分信息,不靠描边、阴影和多种颜色。
2. **内容是主角**:Stage 1 的主角是转写和语料,Stage 2 是声音和录音,Stage 4 是对话,界面退后。
3. **音频是视觉核心**:波形、播放游标、录音按钮优先投入设计精力。
4. **颜色有语义**:紫色是唯一的品牌色,只表示「当前位置 / 已选中 / 已播放」。
5. **不泄露答案**:Stage 2 默认隐藏文字,视频字幕必须关闭或遮挡。
6. **同一位置只表达一种含义**:顶栏、选中态、状态文字在所有页面语义一致。
7. **一屏一个主操作**:黑色主按钮每屏只有一个,按页面主任务判定。

## 4. 色彩

| Token | Hex | 用途 |
| --- | --- | --- |
| `--ink` | #0C0A09 | 主文字、主按钮、当前步骤胶囊、头像 |
| `--ink-2` | #44403C | 文字链接 |
| `--ink-3` | #57534E | 摘要、卡片说明、未选中分区 |
| `--muted` | #78716C | 次级文字、时间戳。**允许用于文字的最浅灰**(白底约 4.8:1) |
| `--line-strong` | #D6D3D1 | 描边按钮、虚线框、空心圆点、未播放波形 |
| `--line` | #E7E5E4 | 进度条底色、弹层描边 |
| `--line-soft` | #F0EEEC | 分割线、当前分区底色、隐藏词块 |
| `--surface` | #FAFAF9 | 卡片、音频条、消息块 |
| `--bg` | #FFFFFF | 页面底色 |
| `--video-bg` | #1C1917 | 视频窗口 |
| `--brand` | #5A43D6 | 唯一品牌色(白底约 6.6:1) |

**紫色允许出现的位置(全部清单):** logo;当前逻辑节点圆点;转写里的高亮下划线(实线 = chunk,虚线 = idiom / 结构);标签页选中下划线;视频和音频的播放进度、已播放波形;选段时间轴选中段;卡片勾选或「当前」的 1.5px 描边(选段卡、语料卡、目标卡);活动图「今天」标记;Landing 标题第二行与示例高亮划线。

**不允许:** 主按钮、分区链接、全局栏当前项、录音按钮、卡片底色、大面积背景、渐变、每项一色、给分数或状态着色。**唯一的渐变例外**:Stage 4 的 AI 伙伴球(仅表示 AI 在说话)。

**使用规则:** 同屏紫色不超过 3 处(logo 不计);不用饱和红橙绿作装饰,语义色出现时才定义;`#A8A29E` 及更浅的颜色不得用于文字。

## 5. 字体

字体族 `Inter`,回退 `system-ui, sans-serif`;时间戳和技术标注用 `ui-monospace, Menlo, monospace`。

| 角色 | 字号 / 行高 | 字重 | 字距 | 颜色 |
| --- | --- | --- | --- | --- |
| Display(仅 Landing 首屏) | 60 / 1.08 | 500 | -0.035em | `--ink` |
| 结尾标题(仅 Landing) | 40 / 1.2 | 500 | -0.03em | `--ink` |
| 营销区块 H2(仅 Landing) | 32 / 1.2 | 500 | -0.025em | `--ink` |
| 页面标题 H1 | 30 / 1.25 | 500 | -0.02em | `--ink` |
| 区块标题 H2 | 22 / 1.3 | 500 | -0.01em | `--ink` |
| 卡片标题 H3 | 17 / 1.35 | 500 | -0.01em | `--ink` |
| 转写 / 对话正文 | 18 / 1.6 | 400 | 0 | 当前 `--ink`,其余 `--muted` |
| 正文 / 摘要 | 15 / 1.6 | 400 | 0 | `--ink-3` |
| 说明文字 | 13–14 / 1.5 | 400 | 0 | `--ink-3` / `--muted` |
| 标签(全大写) | 11 | 500 | 0.08em | `--muted` |
| 时间戳 / 元信息 | 12 mono | 400 | 0 | `--muted` |

标题用 500,不全部加粗;层级靠字号和颜色拉开。原 Stage 3 页的 700 字重和 34px 标题改为 H1 30 / 500。

## 6. 间距与布局

基础单位 4px。常用:4 / 8 / 12 / 16 / 20 / 24 / 32 / 48。

| 页面宽度 | 适用 |
| --- | --- |
| 1280px | 工作区页面:Stage 1、选段、Stage 2、Stage 3、Stage 4、Stage 5 |
| 1080px | 内容页:My learning、Practice history、Landing |
| 1440px 全宽 | Corpus |

| 页面 | 骨架 |
| --- | --- |
| Stage 1 | 三栏:左 268px 逻辑流 / 中 1fr / 右 332px 语料,底部固定操作栏 |
| 选段 | 单栏:标题行 → 时间轴 → 3 列卡片(间距 16px)→ 底部操作栏 |
| Stage 2 | 单栏居中,内容宽 680px |
| Stage 3 | 双栏:主区 1fr + 右侧 320px 预览(sticky) |
| Stage 4 | 对话主区 + 右侧 Targets 栏 |
| Stage 5 | 报告主列 + 右侧 Session 栏 |
| My learning / Practice history / Landing | 单栏居中,内容宽 1080px |
| Corpus | 全宽:标题行 → 标签页 → 工具条 → 卡片网格 |

## 7. 圆角、边框、阴影

| 元素 | 圆角 |
| --- | --- |
| 按钮、分区链接、步骤胶囊、音频条、标签、pill、搜索框 | 999px |
| 视频窗口 | 16px |
| 卡片、弹层、消息块、空状态框 | 14px |
| 时间轴分段、隐藏词块 | 8–12px |

- **阴影:全站不使用。**
- **边框:尽量不用。** 区域用 `--surface` 浅底区分。仅在这些情况用描边:描边按钮(`--line-strong`);选中 / 当前卡片(`--brand` 1.5px,内缩 outline);空状态虚线框;筛选弹层(`--line`,浮在卡片上方需要边界)。分隔用 1px `--line-soft` 或 `--line`。

## 8. 图标

单线风格,线宽 1.5px,圆头端点,推荐 Lucide。行内 16px,按钮内 20–28px。颜色跟随文字色;白色图标只出现在黑色按钮上。装饰图标加 `aria-hidden="true"`,可点击图标必须有 `aria-label`。类型靠图标形状区分,不靠颜色。

## 9. 组件

### 9.1 按钮

| 类型 | 样式 | 用法 |
| --- | --- | --- |
| 主按钮 | 黑底白字,尺寸由共享 sm / md / lg 决定,500 字重,全圆 | 每屏一个,按页面主任务判定 |
| 次按钮 | 透明底,1px `--line-strong`,尺寸与同组主按钮一致,悬停 `--surface` | 其他操作 |
| 文字链接 | 14px `--ink-2`,悬停 `--ink`,无底 | 导航、查看更多、`Clear` |
| 圆形播放 | 36px 黑底,白色图标 | 句子、参考音频 |
| 录音按钮 | 64px 黑色圆,中心白点;录音中变方形 | Stage 2、Stage 4。不用红色或紫色 |

禁用:`--line` 底 + `--muted` 字。主按钮的箭头图标悬停时右移 3px。

普通操作按钮采用共享尺寸：sm 32px / 12px、md 40px / 13px、lg 44px / 14px；图文间距 8px，操作组间距 12px。同一操作组（例如报告页继续练习的三个按钮）统一使用 44px / 14px，主次层级只通过配色表达。Web 使用共享 `ui-button-group` 和显式 `size`；报告操作组统一 `lg`：最小高度 44px、14px 字号、20px 行高、11×18px 内边距，按钮和链接、禁用和加载状态保持相同几何尺寸。

### 9.2 选择与切换

一句话区分:**标签页换内容,分段控件换模式,pill / chip 做过滤。**

| 组件 | 用途 | 选中态 |
| --- | --- | --- |
| 标签页 | 切换同一页的内容视图(All items / High value、评分维度、图表系列) | 2px `--brand` 下划线 + `--ink` 500 |
| 分段控件 | 同一内容的模式切换,选项不超过 4 个(Voice / Chat、Quick / Detailed / Review) | 容器 `--surface`、内边距 4,当前项黑底白字 |
| 筛选 pill | 列表过滤,无容器(All practice / Videos / Shadowing) | 黑底白字 |
| Chip | 弹层或区块内的多选标签 | 黑底白字 |
| 手风琴行 | 进阶设置折叠(Mission preferences 等) | 右侧摘要 + 箭头,展开时箭头旋转 180° |

### 9.3 卡片

- 默认:`--surface`,圆角 14px,内边距 18px,无描边,悬停 `--line-soft`。
- 选中 / 当前:白底 + 1.5px `--brand` 内缩 outline(Stage 3 的已选目标、Stage 4 的当前目标、选段卡、语料卡勾选)。Stage 4 原来的 `--ink` 描边改为 `--brand`。
- 禁止:靛蓝边框(#4F46E5)、浅紫底(#F5F5FF)、用黑色大卡片做强调。需要强调时靠文字层级和留白。

### 9.4 列表行与键值行

- **记录行**(Original videos、Recent practice、Practice history):不做卡片。行间 1px `--line-soft`,内边距 18px 0;左:16px `--ink-3` 线性图标;中:标题 15px / 500 + mono 元信息(`类型 · 日期 · 数量`);右:文字链接 + ↗。
- **日期分组**:标题 14px / 500,组间距 32px。
- **状态**写进元信息文字(In progress / Completed),不用彩色徽章。
- **键值行**(Session at a glance):左 `--muted` 标签,右 `--ink` 数值,行间 `--line-soft`;无数据显示 `—`。
- **手风琴行**:最小高度 60px,上方 1px `--line-soft`,右侧摘要 13px `--muted`。

### 9.5 指标与评分

- **概览卡**:`--surface`,14px,内边距 24px;左:56px 黑色头像 + 姓名;右:4 项指标(数字 30px / 500,标签 13px `--muted`)。
- **评分标签页**(Task fit / Language transfer / Scenario fit / Naturalness):4 列,选中项 2px `--brand` 底线;数值 30px / 500 + `/ 100`;3px 进度条(轨道 `--line`,填充 `--ink`);未评估显示 17px `--muted` 的 `Not assessed` + 1px 虚线。分数不着色。**My learning 的反馈和 Stage 5 的 Assessment 使用同一个组件。**
- 免责说明 12–13px `--muted`,写明「描述这次对话,不是整体英语水平」。

### 9.6 图表

单系列日计数柱状图:柱宽 10px,圆角 3px,`--ink-3`;网格 `--line` 虚线,基线 `--line-strong`;Y 轴 0 / 10 / 20,X 轴只标两端日期;「今天」用基线下 10×3px 的 `--brand` 短条。系列用标签页切换,范围用 pill 切换。图表必须有 `aria-label` 文字摘要。

### 9.7 搜索、筛选工具条与弹层

- 工具条一行:搜索框(40px 全圆,`--surface` 底,无描边)+ 筛选 pill + 排序 + 视图切换。
- 筛选 pill:40px,`--line-soft` 底;有选中项时黑底白字并写数量(`Difficulty · 2`)。
- 弹层:白底、1px `--line`、14px 圆角、内边距 16px、宽 320px、最大高 360px 内部滚动,出现在 pill 下方 8px;一次只开一个,点空白处关闭;弹层内 `Clear` 只清本组,行末 `Clear all` 清全部。
- 规则:同组多选为「或」,不同组为「且」;每次显示 15 条,`Load more` 追加;无结果显示空状态。

### 9.8 音频、转写与录音(Stage 1 / 2)

- 视频窗口:`--video-bg`,圆角 16px;进度条 4px,已播放 `--brand`。
- 逻辑流:左栏,当前节点 6px `--brand` 圆点 + `--ink` 600,其余 `--line-strong` 圆点;时间戳 mono。
- 转写:当前句 `--ink`,其余 `--muted`;chunk 用实线、idiom 用虚线的 2px `--brand` 下划线(offset 4px)。
- 参考音频条:`--surface` 全圆;波形已播放 `--brand`,未播放 `--line-strong`。
- Stage 2:跟读前隐藏文字(不泄露答案),录音后才显示;录音按钮见 9.1。
- 其余尺寸沿用 [libitu 设计规范 v1.1](https://claude.ai/artifact/KAeLKQ7rP1QfHLNrkyZgLc) 第 7 节。

### 9.9 对话组件(Stage 4)

- **消息行**:两列网格,左 56px 放角色标签(Partner / You,标签样式),右放 18px / 1.6 正文。靠角色标签区分说话人,不用气泡底色。
- **纠正块** `Another way to say it`:`--surface` 块,14px 圆角,内边距 14×18;被更正的词用 `--brand` 下划线。
- **阶段分隔**:1px 横线 + 阶段名(标签样式),如 Tension。
- **目标卡**:默认 `--surface`;状态用文字(Used on your own / Modeled once / Not reached);当前目标用 `--brand` 描边;Reveal 为文字链接。
- **AI 伙伴球**:唯一允许的渐变;说话时缩放不超过 4%,静止时不动。
- **模式切换**:分段控件 Voice / Chat;状态用小圆点 + 文字(Listening / Speaking)。
- **暂停 / 断线**:行内提示块(`--surface`)+ 一句说明 + 一个操作按钮。不用红色,不弹窗。
- **提示 Hint**:由文字链接展开,显示在输入区上方。

### 9.10 报告组件(Stage 5)

- **Targets 行**:左 mono 阶段名,中标题 + 说明,右状态文字。
- **Corrections**:旧词删除线 `--muted` → 新词 `--ink` + `--brand` 下划线;下方一句说明。
- **Assessment**:同 9.5 评分标签页。**Source transcript**:可折叠,保留 `Show / Hide transcript` 文字链接。
- **Session at a glance**:键值行。
- **Keep the practice going**:`Retry this mission` 为主按钮;`Adjust loadout`、`New mission` 为次按钮。

### 9.11 空状态、加载、错误

空状态:1px 虚线 `--line-strong` 框,14px,标题 + 一句建议 + 次按钮。加载:`--line-soft` 骨架块或一行文字(Preparing…)。错误:行内提示块 + 重试按钮,不用红色。数据缺失显示 `—`。

### 9.12 三层分析(Stage 2 Detailed)

**页面结构**

- 查看分析时使用全局栏 + 流程栏,只有录音中才切换为专注模式栏。标题区:标签 `Shadow`、H1、mono 元信息;右侧是分段控件 `Quick / Detailed / Review` 和次按钮 `Back to segments`。
- 左栏 280px 句子列表(sticky):`Sentences` 标题 + 折叠图标按钮 + `13 in this segment` + 复选框。行 = mono 序号 + 句子 + mono 元信息(状态 · 时间)。当前行 `--line-soft` 底 + `--ink`;状态只写文字。
- 主列最宽 820px,自上而下:句子导航 → 参考音频卡 → 当前句 → 已存录音说明 → 三层分析 → Takes。

**当前句与录音区**

- 当前句 26px / 1.75,居中。识别偏差:多说的词用 mono `+ the`(`--muted`);被识别成别的词的原词加 1.5px `--ink` 虚线下划线,下方 mono 小字 `recognized “helping”`。不用橙色。
- 匹配状态一行:对勾图标 + mono(`96.2% of words matched · three-layer analysis eligible`)。
- 操作行:`Listen`(次)、`Record again`(**主按钮,整屏唯一**)、`Replay mine`(次)、删除图标按钮(`--ink-3`,带 `aria-label`)、时长 mono。`Back to segments` 只保留页面右上角,不再做第二个黑色大按钮。
- 破坏性操作(Delete captured reference、Delete analysis、Delete practice record)一律用普通文字链接 `--ink-2`,不用红色;执行前二次确认。
- 重复的错误提示合并为一处:参考音频卡里一条说明 + 一个次按钮 `Retry reference upload`;`Turn off`、`Audio settings`、`How it works` 为文字链接。

**三层标签页**

- 用标签页(9.2),标签只写 Sound / Rhythm / Melody,去掉原来的对勾徽章。只有被锁定的层才显示锁图标和 `Locked`(如匹配率 60–85% 时 Rhythm / Melody 锁定)。
- 每层顶部:H2 层名 + 一句 15px `--ink-3` 说明 + 右侧次按钮 `Notes`。
- **Feedback / Tip 不再占右栏**,默认折叠在 `Notes` 里;展开后是 `--surface` 卡,左 Feedback、右 Tip。图表因此可以使用主列全宽。

**Sound 层**

- 现象过滤:`All` + 10 个现象 chip(Linking、Weak、Flap-T、Elision、Assim.、Glottal、Drop-D、H-drop、Vowel len.、Voicing),自动换行,不横向截断,选中黑底白字。选中某现象后,其他现象的标记降到 20% 不透明度。
- 现象标记用 mono 小标签(`LK`、`WK`……,`--line-soft` 底,5px 圆角),放在单词下方,不再用彩色字母块和弧线。「Your voice」中尚未评估的标记用虚线轮廓 + `?`(如 `WK?`)。
- `Reference` 和 `Your voice` 各占一块:标签 + 词流(19px,词间距 10×14px,自动换行),两块之间 1px 分隔。图例合成一行 mono 文字,不着色。
- `Shadow mode` 行:次按钮 `Hide text` / `Show text`。隐藏时参考词变成 `--line-soft` 词块,点击单个词逐个揭示。

**Rhythm 层**

- 「Your voice」使用共用时间轴(9.14),只显示 Rhythm 轨道,词名在柱子下方;不分行,可缩放和拖动。
- 柱高 = 相对突出度(共享 0–0.88 刻度,最高 52px,`--ink-3`);不确定 = 虚线轮廓柱;未比较 = 无柱。每词的柱子后面有一层淡色响度包络(见下)。
- 点击一个词:`--brand` 描边,下方一行读数。选中词与 Melody 标签页、总览保持同步。
- 原来的 27 行表格去掉,信息已在图里;要精确值时点词查看。
- 参考不可用时,在时间轴上方写一行 mono 说明 `Reference unavailable for this take.`。
- 固定说明:`Continuous relative prominence, not a stress label or a correctness score`,以及未校准的免责,13px `--muted`。

**响度包络(背景层):** 每个词的柱子后面加一层淡色响度包络:面积图,底边与柱子基线对齐,最高 52px,填充 `--line`,无描边,柱子仍在最前面。包络只表示响度(能量),不表示重音:图例写「Light shape = loudness」,突出度柱的标题仍写 Prominence,不写 Stress。因为词宽与时长成比例,词与词之间的平坦空隙就是停顿;Rhythm 标签页和总览使用同一套数据与样式。包络需要在分析时保存能量包络(约每 20ms 一个点,不能还原语音内容)。录音不保留(No retained audio),所以不能从录音文件现画。本版为示意数据。

**Melody 层**

- 使用共用时间轴(9.14),只显示 Melody 轨道;图例和 `Play reference` / `Play your voice` 在时间轴上方,不分行,可缩放和拖动。
- 音高曲线画 F0 连续曲线(每 20ms 一个点),单位是相对各自中位数的半音。**曲线为黑色**:`Your voice` = `--ink` 1.75px 实线;`Reference` = `--muted` 1.5px 虚线,不可用时图例灰显并注明 `unavailable`。紫色不用于曲线。
- 清音和停顿处曲线断开,不连线插值。纵轴 +12 到 −12,约 4px/半音,轨道高 112px;刻度 `+12` / `0` / `−12` 写在左侧轨道标签栏,0 线 `--line-strong`。
- 点击一个词:`--brand` 描边(表示当前选中),下方一行读数。
- 接入真实数据时,用每个词的 F0 帧序列替换示意数据即可;无 F0 的词(未匹配)不画线,只保留词宽。

**Takes**

- 每次录音一行 `--surface` 圆角卡;当前选中 = 白底 + 1.5px `--brand` 描边。行内:时间 15px / 500 + mono 元信息 + `No retained audio` + `View analysis`(次)+ `Delete practice record`(文字链接)。隐私说明 13px `--muted`。

**相对原页面去掉的:** 红色和橙色文字、彩色现象字母块、层标签上的对勾徽章、右侧 Layer focus 栏、27 行表格、重复的状态消息、第二个黑色 `Back to segments` 大按钮。

### 9.13 总览(Stage 2 Review)

**用途:** 复盘时一次看清「哪个词为什么听起来被强调」。逐层学习仍用 Detailed 的三个标签页(9.12),总览不取代它们。

**结构**

- Review 模式下,三层标签页换成 `Overview` 区块;标题区:H2 `Overview` + 一句 15px `--ink-3` 说明 + 右侧三个层开关(`Sound` / `Rhythm` / `Melody`,chip,开 = 黑底白字,可多选)。标题下方是 `Take`(选哪一次录音)和 `Voices`(显示参考 / 你)两行 chip,见 9.15。
- **不分行**:整句是一条共用时间轴(9.14),可缩放、可拖动。
- **三条分轨上下对齐,共用词轴**:左侧 72px 轨道标签,右侧每词一列,三条轨道在同一列内垂直叠放,列宽与词时长成比例。

| 轨道 | 高度 | 内容 |
| --- | --- | --- |
| Sound | 60px | 词(16px)+ 下方 mono 现象标记(`LK`、`WK`……),标记是文本推断的可能读法 |
| Rhythm | 72px | 相对突出度柱(最高 52px,`--ink-3`,共享 0–0.88 刻度);不确定 = 虚线轮廓;未比较 = 无柱 |
| Melody | 112px | F0 曲线(`--ink` 1.75px 黑色,清音与停顿处断开),0 线 `--line-strong` 贯穿 |

总览的 Rhythm 轨道同样在突出度柱后加响度包络背景(高 52px)。因为这里词宽与时长成比例,词与词之间的平坦空隙就是停顿。

- **不做的事:** 不把 Rhythm 和 Melody 画成双纵轴叠在同一张图里。每层各有一条轨道,各用自己的纵轴,只共享词轴(横向)。轨道之间 1px `--line-soft` 分隔。
- **选中同步**:点任意轨道里的一个词,整列(所有可见轨道)显示 `--brand` 描边,下方一行读数。选中词在 Detailed 的 Rhythm、Melody 标签页里保持一致。
- **层开关**:关闭一层时,该轨道和左侧轨道标签一起消失,其余轨道自动上移,列宽不变。全部关闭时显示虚线空状态框「Turn on at least one layer」。
- **参考音频可用时**:两个声音的区分、泳道和读数见 9.15。
- **说明文字**:图例一行 mono(标记含义、柱高刻度、曲线单位),下方 13px `--muted` 声明数据性质。

### 9.14 共用时间轴(缩放与拖动)

Rhythm 标签页、Melody 标签页和 Review 总览共用同一个时间轴组件。**不分行,整句是一条横向时间轴。**

- **结构**:左侧 72px 轨道标签(固定,不随缩放移动),右侧是可滚动区域。顶部 24px 时间尺(每秒一个刻度,mono 10px,1px `--line` 竖线);下面每词一列,**列宽 = 词时长 × 缩放系数**。轨道自上而下:Sound(60px)/ Rhythm(72px)/ Melody(112px,左侧标 `+12` / `0` / `−12`)。没有 Sound 轨道时,底部加一行词名(28px)。
- **缩放**:工具条右对齐:缩放百分比(mono)+ `−` 按钮 + 滑块(140px)+ `+` 按钮 + `Fit` 次按钮。默认 100%(约 0.18px/ms),范围约 33%–333%(0.06–0.6px/ms);`−` / `+` 每次步进一档;`Fit` = 整句恰好适配主列宽。词变窄时词名单行截断,柱宽随列宽收窄(最窄 3px)。
- **拖动**:鼠标在时间轴区域按住左右拖动平移(光标 `grab`);拖动超过 4px 后不触发点词,避免误选;触屏用原生横向滚动。
- **选中**:点一个词,`--brand` 描边贯穿所有可见轨道,下方一行读数 `词 · 时长 · 突出度 · 音高范围 · 现象标记`。选中词在 Rhythm、Melody、总览之间同步。
- **各视图的轨道**:Rhythm 标签页只开 Rhythm 轨道;Melody 标签页只开 Melody 轨道,图例和 `Play reference` / `Play your voice` 放在时间轴上方;Review 总览按三个层开关组合轨道。
- **说明文字**:图例随可见的层变化,统一追加「Word width follows duration. Drag to pan.」。
- **不做**:不分行或分短语;不用滚轮缩放(会和页面滚动冲突);不把 Rhythm 与 Melody 画成双纵轴;时间轴内不放 Notes。

### 9.15 参考音与用户音的区分(Review)

**Review 的定位:** 回来查看某一次录音保存下来的完整分析。因此 Review 总是针对「一次具体的录音」,并且在参考音可用时,同时呈现参考音和你的声音。

**选择录音:** 标题区下方有 `Take` 一行:每次录音一个 chip(如 `9:05 PM · 17.3s · No reference`),选中 = 黑底白字。Takes 列表里的 `View analysis` 按钮会跳到 Review 并选中那一次。

**视觉编码(全站统一,不靠颜色):**

| 元素 | Reference | You |
| --- | --- | --- |
| 音高线(Melody) | `--muted` 1.5px 虚线 | `--ink` 1.75px 实线 |
| 突出度柱(Rhythm) | `--line-strong` 填充 | `--ink-3` 填充(不确定 = 虚线轮廓) |
| 响度包络 | 更浅的灰(`#EFEDEB`) | 淡灰(`--line` 级) |
| 词时长基线(Rhythm 泳道底边) | 2px `--line-strong` | 2px `--ink` |
| Sound 标记 | 实线小标签(文本推断的可能读法) | 已评估 = 实线;未评估 = 虚线轮廓 + `?` |

原则:**参考 = 浅、灰、虚线;你 = 深、黑、实线。** 紫色只用于选中词的描边,不用来区分两个声音。

**对齐方式:** 按词对齐,每词一列;两个声音各按自己的时长在列内左对齐绘制,列宽 = 两者时长中较大的一个。所以词时长和停顿的差异仍然看得出来(短的一条更短),音高曲线按各自时长压缩,可以直接比较形状。两个声音同时在轴上时,秒刻度尺隐藏(两者时间不共线),词内时长靠词时长基线读取。

**分轨内的泳道:**

- Sound:词名一行(28px)+ Ref 标记一行(22px)+ You 标记一行(22px)。
- Rhythm:Ref 泳道(64px)在上,You 泳道(64px)在下,各有自己的基线,共用 0–0.88 刻度;不把两根柱并排放在一起。
- Melody:两条曲线叠在同一个纵轴上(单位相同,都是半音),不拆泳道。
- 左侧轨道标签栏的右侧用 mono `Ref` / `You` 标出各泳道。

**图例与开关:**

- 时间轴上方一行图例:虚线 `Reference`、实线 `You`;参考不可用时 Reference 降到 40% 不透明度并注明 `unavailable`。
- 参考可用时显示 `Voices` 两个 chip(`Reference` / `You`),可单独隐藏其中一个,至少保留一个。

**读数:** 点词后,下方一行同时给出两侧数值:`词 · You 时长 · 突出度 · Reference 时长 · 突出度 · Δ 时长差 · 现象标记`。Δ = 你 − 参考,正数表示你说得更慢。

**参考不可用:** 只显示你的声音,不显示 Ref 泳道和 Ref 标签;说明一行 mono:`Reference audio unavailable for this take. Showing your voice only.`;`Play reference` 禁用。

参考数据在原型里是示意数据。

### 9.16 Corpus detail 弹窗（Stage 1 / Corpus library）

- 原生 modal dialog，宽度最多 880px、圆角 14px、无阴影；中性蒙层。标题区固定，内容区独立滚动，Explain / Syntax 标签栏在滚动区顶部吸顶。窄屏留 8px 外边距，正文 16px 内边距；长内容不得横向溢出。支持 Escape、焦点约束/返回和标签方向键。
- 转写选词的 Add to corpus 复用同一尺寸、中性蒙层、标题、原句、标签栏和内容样式，去掉旧蓝色引用块和阴影。蒙层不拦截操作，保留非模态浮卡的固定、点外关闭及新选择替换行为，提供关闭按钮和 Escape；按视口定位，避免被 Reader 栏裁切。字段编辑、My note 和 Save 放在分析后的管理区。
- 标签页不是模式胶囊：选中项紫色 2px 下划线、`--ink` / 500；其余 `--muted`。背景透明。
- 原句不加蓝色竖条或高亮底。chunk 用紫色实线下划线，idiom / structure 用虚线，与转写一致。时间戳用带播放图标的 sm 次按钮，显示 `0:38`，保留实际 seek 精度；库中有 YouTube 来源时打开该时间点。
- teacher_note 是 Explain 第一块自然中文说明；随后 Use it 框架和 slot 说明、常见搭配、Meaning、Pronunciation、近似表达、例句。场景只在例句末尾用 mono 一行、`·` 连接，不再在其他模块罗列。
- IPA 和文本重音标注使用 mono 15px / 400。中文摘要 15px / 500 / `--ink`，说明 `--ink-3`。例句的 `typical` 是灰色 mono 小字。
- 近似表达使用列表行，左侧表达 500，右侧差异 `--ink-3`；手机上下排布。chip 只放短标签，不塞长解释。
- 短语 Syntax 仅保留内部结构、句中角色、前后句逻辑；完整句子或 structure 才显示完整模块。不显示无内容的占位模块，不默认展示词源、词族；易错点有实际内容才出现。
- 底部 Ask about this：输入框 + 三个按需追问建议，回答受限 Markdown 流式显示。成功完成才可存为笔记；保存失败保留回答并允许重试，不提前显示已保存。未收藏选择明确显示草稿状态。
- Corpus library 卡片沿用统一中性样式，显示等级 / 语体、表达 / 释义、首个已保存表达框架；打开后复用同一详情组件，编辑和删除仍属于库管理操作。

## 10. 页面总表

| 页面 | 栏 | 主操作 | 紫色出现的位置 |
| --- | --- | --- | --- |
| Landing | 未登录栏 | Analyze video / Paste a video link | logo、标题第二行、示例高亮划线 |
| Stage 1 摄取 | 全局栏 + 流程栏 | 进入下一步(沿用原型) | 当前逻辑节点、转写下划线、播放进度 |
| 选段 | 全局栏 + 流程栏 | 开始跟读(沿用原型) | 选中段与选中卡描边 |
| Stage 2 跟读 | 专注模式栏 | 录音按钮 | 已播放波形、转写下划线 |
| Stage 3 Loadout | 全局栏 + 流程栏 | Start mission | 已选目标卡描边 |
| Stage 4 对话 | 专注模式栏 | 录音按钮 / Start conversation | 当前目标描边、转写下划线 |
| Stage 5 报告 | 全局栏 + 流程栏 | Retry this mission | 评分标签选中下划线 |
| My learning | 全局栏 | Continue Mission | 评分标签与图表系列标签下划线、图表「今天」标记 |
| Practice history | 全局栏 | New Mission | 无 |
| Corpus | 全局栏 | Open Loadout | 标签页下划线、卡片勾选描边 |

## 11. 状态与动效

**应用内页面(克制):**

- 时长 120–200ms,`ease-out`;只动颜色、透明度、位置。
- 悬停:次按钮底变 `--surface`,卡片底变 `--line-soft`,文字链接变 `--ink`。
- 焦点:按钮和链接用 2px `--brand` 外轮廓(offset 2px);输入框容器聚焦时底色变白 + 1.5px `--ink` 轮廓。
- 弹层出现 160ms:从上方 4px 淡入。

**Landing(营销页例外):**

- 首屏入场:元素依次上移 16px 淡入,700ms,间隔 90ms,只播一次。
- 声波:标题上方 5 条竖线 `scaleY` 循环,1.1s,是整页唯一的循环动效。
- 滚动入场:CSS 滚动驱动动画(`animation-timeline: view()`),不依赖 JS;不支持的浏览器直接显示最终状态。
- 示例:短语下划线随滚动从左向右展开,之后「已收藏」「你说出」依次出现。
- 悬停位移(图标上移 3px、箭头右移 3px)只用于 Landing。
- 系统开启 `prefers-reduced-motion` 时关闭全部动画。
- 不做:自动轮播、打字机、鼠标跟随、视差、弹跳。

## 12. 无障碍

- 文字对比度达到 WCAG AA;可点击区域不小于 32×32px。
- 状态写在属性里:`aria-pressed`(chip / pill)、`aria-selected`(标签页)、`aria-expanded`(手风琴、弹层)、步骤胶囊 `aria-current="step"`、全局栏当前分区 `aria-current="page"`。
- 动态状态区域(Listening / Speaking、暂停、断线)用 `aria-live="polite"`。
- 图表、波形提供文字摘要;装饰图标 `aria-hidden`。
- 所有弹层可键盘操作并用 Esc 关闭(落地时实现)。

## 13. 文案

- 界面为英文;标签全大写小字;按钮以动词开头(Start mission、Continue)。
- 不用感叹号和表情;评估用语写「描述这次对话」,不暗示权威评分。
- 时长 `1m 20s`,日期 `Oct 30, 2026`;引用原句用弯引号 “ ” 和 ’。
- 状态词统一:In progress / Completed / Not assessed / Not reached / Modeled once / Used on your own。

## 14. CSS Tokens

```css
:root {
  --ink: #0C0A09;  --ink-2: #44403C;  --ink-3: #57534E;  --muted: #78716C;
  --line-strong: #D6D3D1;  --line: #E7E5E4;  --line-soft: #F0EEEC;
  --surface: #FAFAF9;  --bg: #FFFFFF;  --video-bg: #1C1917;
  --brand: #5A43D6;
  --font: Inter, system-ui, sans-serif;
  --mono: ui-monospace, Menlo, monospace;
  --r-pill: 999px;  --r-card: 14px;  --r-video: 16px;
  --page-max: 1280px;  --content-w: 1080px;  --page-wide: 1440px;
  --nav-h: 64px;  --flow-h: 52px;
  --ease: cubic-bezier(.2, .7, .2, 1);
}
```

## 15. 迁移清单

| 页面 | 现状 | 要改什么 |
| --- | --- | --- |
| Stage 1 / 选段 | 顶栏里放标题 + Stage 胶囊 + Corpus / My learning | 换成全局栏 + 流程栏(Ingest / Shadow) |
| Stage 2 录音 | 同上 | 专注模式栏 |
| Stage 3 Loadout | 靛蓝、#FAFAFA 底、描边卡、黑色 Quick start 大卡、700 字重、粉色头像 | **已按本规范重画**(画布 Loadout 画板) |
| Stage 4 | 顶栏居中 Stage 1–5 胶囊;当前目标 `--ink` 描边 | 专注模式栏;当前目标描边改为 `--brand` |
| Stage 5 | 顶栏居中 Stage 1–5 胶囊 | 全局栏 + 流程栏(Mission 分区高亮,Report 为当前) |
| My learning / Practice history / Corpus | 分区居中、Corpus 与 My learning 靠右 | **已换成全局栏**(画板已更新) |
| Landing | 自有页头 | 保持;登录后右侧为 My learning + 头像 |
| 所有页面 | 开发调试悬浮按钮 | 上线前确认隐藏 |

## 16. 实现建议(前端)

### 16.1 现状与原则

- 现状:Next.js 15 + React 19;样式是 CSS Modules + 全局 CSS(`globals.css` 约 4,000 行,以 Stage 1 / 2 为主)+ `packages/ui/src/tokens.css` + `practice-theme.css`;已使用 `lucide-react` 和 `@radix-ui/react-select`。页面已全部实现,当前工作是调整样式和交互。
- **原则:不换样式体系。** 不引入 Tailwind、shadcn/ui 或 CSS-in-JS;在 CSS Modules + token 上收敛。新代码走统一入口,旧代码逐步收缩,不一次性重写 `globals.css`。

### 16.2 Token

- 把第 14 节的变量补进 `tokens.css`。已有变量名不一次性改名:旧名先指向新 token,迁移完再删。
- `practice-theme.css` 里的变量值对齐新 token,改一次即可让 Stage 1 / 2 大致换色。
- 除 token 文件外,页面和组件里不得出现十六进制颜色。

### 16.3 共用组件(`@libitu/ui`)

- 先做 Button(primary / secondary / link)、Tabs、SegmentedControl、FilterPill、Card、ListRow、EmptyState,用 CSS Module 写。
- 变体和状态用属性驱动:`data-variant`、`aria-pressed`、`aria-selected`、`data-state`,样式与无障碍属性是同一套。
- 按钮焦点:`:focus-visible` 2px `--brand` outline,offset 2px。
- 动态值(进度条宽度等)给 CSS 变量赋值:`style={{ '--progress': ... }}`,CSS 里写 `width: var(--progress)`。

### 16.4 图标

统一用 `lucide-react`,在 `@libitu/ui` 封装 `Icon`:尺寸 16(按钮内 20–28)、`strokeWidth` 1.5,装饰图标 `aria-hidden`。

### 16.5 Radix 包(按需,做到哪个页面装哪个)

| 设计里的组件 | 用什么 |
| --- | --- |
| 筛选弹层 | `react-popover` |
| 进阶设置手风琴 | `react-accordion` |
| 分段控件、筛选 pill | `react-toggle-group` |
| 标签页 | `react-tabs` |
| 卡片勾选 | `react-checkbox` |
| 排序(3 个以上选项) | 已有的 `react-select` |

Radix 各包版本保持一致。Chrome 扩展内的弹层需要把 Portal 的 `container` 指向 Shadow DOM。

### 16.6 导航落地

用 Next.js 路由分组在布局层统一导航,页面不再各自画顶栏:

- 全局栏放在应用外层 layout,当前分区由 `usePathname` 判断。
- 流程栏放在 Practice / Mission 流程页的分组 layout。
- 专注模式(Stage 2 录音、Stage 4 对话)用布局状态切换为合并的单条栏。
- Landing 单独分组,使用自己的页头。
- 「点分区回到最近的流程页」需要按分区记录最近访问的路径。

以上是结构示意,路由以实际仓库为准。

### 16.7 动效

- 默认全部用 CSS:`transition`、Radix 的 `data-state` 驱动关键帧、Landing 的 `animation-timeline: view()`、一条统一的 `prefers-reduced-motion` 媒体查询。
- `motion` 暂不引入,只在 Stage 4 的 AI 伙伴球弹簧动画或需要退出动画时再加。
- 音频波形沿用现有实现(pitchy、vad-web 管线),不引入 wavesurfer.js。

### 16.8 Clerk

通过 Clerk 的 `appearance` 配置把主色、圆角、字体对齐规范(字段以 Clerk 文档为准)。全局栏右上角头像自绘为黑色圆形,保证与规范一致。

### 16.9 防止回退

- stylelint:`color-no-hex`(`tokens.css` 除外);禁止 `box-shadow`(`none` 除外),把「全站无阴影」变成机器检查。
- 改 `globals.css` 前,用 Playwright 给关键页面存截图基线,改完对比。
- 新旧样式出现覆盖冲突时,可把旧的 `globals.css` 内容放进 `@layer legacy`。这会改变覆盖关系,改完需逐页检查。

### 16.10 迁移顺序与未核实项

1. token + 别名 + `practice-theme.css` 变量值对齐。
2. 导航布局(16.6)。
3. 共用组件,先用在 My learning、Practice history、Corpus、Stage 3。
4. Stage 1 / 2 的全局样式最后按功能拆分。

**未核实:** 现有 `tokens.css` 的变量名、Clerk `appearance` 的具体字段、Radix 各包与 React 19 的版本匹配。落地前需要对一下。

## 17. 待确认

- 页面上方的小标签(如 `Stage 3 · Prepare to use your English`)是否也去掉数字,与流程栏保持一致。
- 点分区时,如果该分区没有进行中的内容,落点是入口列表,是否合适。
- Stage 1 和选段的主操作和细节沿用原型,本文没有重新定义;Stage 2 Detailed 的三层分析见 9.12。
- High value 的判定规则;Scenario / Register 每条语料的数据来源。
- Chrome Web Store 上线后 Landing 的 Add to Chrome 状态。
- 按钮的键盘焦点样式、弹层 Esc 关闭,在原型里尚未逐一实现。
- AI 伙伴球作为唯一渐变例外是否接受。
