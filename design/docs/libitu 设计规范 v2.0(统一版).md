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
| 主按钮 | 黑底白字,内边距 14×26,15px / 500,全圆 | 每屏一个,按页面主任务判定 |
| 次按钮 | 透明底,1px `--line-strong`,内边距 8×14,13px,悬停 `--surface` | 其他操作 |
| 文字链接 | 14px `--ink-2`,悬停 `--ink`,无底 | 导航、查看更多、`Clear` |
| 圆形播放 | 36px 黑底,白色图标 | 句子、参考音频 |
| 录音按钮 | 64px 黑色圆,中心白点;录音中变方形 | Stage 2、Stage 4。不用红色或紫色 |

禁用:`--line` 底 + `--muted` 字。主按钮的箭头图标悬停时右移 3px。

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
- Stage 1、选段、Stage 2 的主操作和细节沿用原型,本文没有重新定义。
- High value 的判定规则;Scenario / Register 每条语料的数据来源。
- Chrome Web Store 上线后 Landing 的 Add to Chrome 状态。
- 按钮的键盘焦点样式、弹层 Esc 关闭,在原型里尚未逐一实现。
- AI 伙伴球作为唯一渐变例外是否接受。
