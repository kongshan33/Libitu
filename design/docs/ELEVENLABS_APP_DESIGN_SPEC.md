# ElevenLabs App 设计规范（基于线上已登录产品全站实测总结）

> **文档性质**：外部产品设计系统深度逆向与实测参考文档（非 Libitu 规范本身；Libitu 自身 UI 规则仍以 [`Libitu_Design_Spec.md`](./Libitu_Design_Spec.md) 和 [`packages/ui/src/tokens.css`](../../packages/ui/src/tokens.css) 为准）。  
> **采样来源**：`https://elevenlabs.io/app/*` 已登录桌面端（视口 `1440×728`，Light Mode 默认主题，同时提取 `.dark` 完整样式表变量），采集日期 `2026-11-23`。

---

## 1. 采样范围与总览

### 1.1 已实测页面清单（共 17 个核心页面）

| 平台模块 | 路由 | 页面类型 | 典型 UI 特征 |
| --- | --- | --- | --- |
| **Agents Platform** | `/app/agents` | AI 入口工作台（Architect） | 居中 Waldenburg 问候标题、悬浮多阶阴影 Prompt 框、药丸建议芯片、视频引导卡、Checklist 列表 |
| | `/app/agents/agents` | 实体列表页 | `h1` + 右侧主/次 CTA、`40px` 搜索框、筛选芯片条、浮动 Quick tip 提示卡 |
| | `/app/agents/triage` | 状态分组列表（Issues） | 状态筛选、排序工具栏、分组折叠表头（Pending / In progress / Resolved / Cancelled） |
| | `/app/agents/history` | 日志/历史记录 | 分段 Tabs + `Alpha` 胶囊徽章、筛选芯片、自定义列按钮、标准空状态卡片 |
| | `/app/agents/knowledge-base` | 知识库（RAG） | 存储配额指示条、4 列快捷创建操作瓷砖（`80px` 高）、搜索 + 空状态 |
| | `/app/agents/tools` | 工具管理 | 3 列快捷创建瓷砖、类型/创建者/Agent 筛选栏、标准空状态 |
| | `/app/agents/agent-testing` | 测试与评估 | Tabs + 筛选栏 + 实心黑主按钮 + 次级白按钮 + 空状态 |
| | `/app/agents/settings` | 工作区设置 | 水平分段 Tabs、表单分组、Webhook 列表与次级添加按钮 |
| **Creative Platform** | `/app/home` | 创意总入口（Producer） | 顶部黑底公告横幅（`40px`）、单行药丸 Prompt 框（`52px`）、多模态快捷入口、横幅轮播与模板网格 |
| | `/app/speech-synthesis/text-to-speech` | 语音合成工作区 | 左右分栏：左侧无边框大文本画布（含 Audio Tags），右侧 `500px` Inspector（底线 Tabs `Settings / History`） |
| | `/app/voice-library` | 声音库 | 宽搜索栏 + 筛选下拉按钮 + 类别标签 + 声音卡片网格与圆形黑色播放键 |
| | `/app/studio` | Studio 项目工作台 | 居中创建 Hero、分段 Tabs（`Tools / Examples`）+ 底线 Tabs（`All / Video / Audio`）双层导航 |
| | `/app/sound-effects` | 音效生成 | 顶部类别流、底部/居中 Prompt 卡片 + 示例提示词芯片 + 圆形播放按钮 |
| | `/app/music` | 音乐生成 | 双层结构 Prompt 卡片（`700px` 宽，顶部灰底参数栏 + 底部输入区）、波形/BPM 列表 |
| | `/app/dubbing` | 配音工作台 | 右侧浮动抽屉（`335px` 宽、左圆角 `16px`） |
| **Platform & Billing** | `/app/developers` | 开发者 / MCP & API | `max-w-6xl` 布局、CLI 复制命令栏、Spend 指标与切换胶囊（`Dollars / Credits`）、数据表 |
| | `/app/subscription/agents` | 订阅与配额 | Credits 进度卡、计费周期切换、横向滚动 `240px` 套餐卡片、全量特性对比表 |

### 1.2 与营销官网（`DESIGN.md`）的本质区别

此前 [`DESIGN.md`](./DESIGN.md) 记录的是 `elevenlabs.io` 营销官网特征，而真正的 **App 产品端（`/app/*`）** 采用了完全不同的工程化设计体系（`rebrand-body`）：

| 维度 | 营销官网（`elevenlabs.io`） | 产品应用端（`elevenlabs.io/app/*`） |
| --- | --- | --- |
| **色彩气质** | 偏暖石色点缀（`#f5f2ef`、`#777169`、暖棕阴影） | **极度克制的纯中性无彩灰（`0 0% L%`）+ 透明黑/白 Alpha 阶梯** |
| **标题字重** | `Waldenburg` Light `300`（超轻展示风） | `Waldenburg` Regular **`400`**（页头 `24px/30px`）+ `WaldenburgHF` **`600`**（空状态/强调小标题） |
| **按钮形态** | 大圆角全药丸（`9999px`）为主 | 矩形微圆角（**`10px` / `9.6px` / `8px`**）为主；全药丸仅用于图标圆钮、建议芯片与徽章 |
| **边框系统** | 显式 `#e5e5e5` 或多阴影描边 | 全局统一 `.rebrand-body * { border-color: var(--gray-alpha-150); }`（**`7.5%` 透明黑/白**） |
| **阴影语言** | 少量卡片阴影与暖色阴影 | 标准化物理多阶自然阴影 **`shadow-natural-xs/sm/md/lg`**（6~7 层指数衰减叠加） |

---

## 2. 设计哲学与核心原则

1. **纯中性画布，内容为王**：整个产品 UI 不使用品牌主色做大面积装饰；主画布为纯白 `#ffffff`，侧边栏为极浅灰 `#fafafa`，主文字与主按钮为近黑 `#0f0f10`（`hsl(240 3% 6%)`）。彩色只出现在媒体封面、图表、状态指示点（Toast dot）、Audio Tags 和付费营销横幅上。
2. **Alpha 优先的语义分层**：边框、悬浮态、选中态、次级文本大量使用 **基于黑/白透明度的 21 阶 Alpha 色阶**（`--gray-alpha-50` ~ `950`），在亮/暗主题间自动在 `--darken-*`（黑透明）与 `--lighten-*`（白透明）之间镜像翻转，从而在不同底色上都能保持一致的光学层次。
3. **排印驱动层次而非色块堆砌**：页面标题统一用 `Waldenburg 24px w400` 制造克制的编辑感与品牌辨识度；所有功能型 UI 严格落回 `Inter`（支持可变字重如 `375 / 450 / 500 / 550 / 600`），避免视觉噪音。
4. **物理光学阴影替代重边框**：对于核心 AI 交互载体（Prompt 输入盒、悬浮卡片、弹窗、Toast），以 `0 0 0 1px rgba(0,0,0,0.06)` 发丝外环叠加 `1px → 3px → 6px → 12px → 24px → 48px` 多层柔影营造“微悬浮纸面”质感。
5. **容器查询优先的自适应布局**：主区域声明 `@container`，顶栏高度（`6.25rem` → `@lg: 3.125rem`）与页面内边距（`16px` → `@xl: 24px` → `@4xl: 56px`）均跟随主工作区宽度而非仅跟随视口宽度响应，侧边栏折叠或右侧抽屉打开时内容区能优雅重排。

---

## 3. 色彩与主题系统（Color & Theme Tokens）

### 3.1 核心语义色（Light vs Dark）

| CSS 变量 | Light 模式原始值 | Light 近似色 | Dark 模式原始值 | Dark 近似色 | 典型用途 |
| --- | --- | --- | --- | --- | --- |
| `--background` | `0 0% 100%` | `#ffffff` | `240 3% 6%` | `#0f0f10` | 主画布、卡片底色 |
| `--background-alt` | `0 0% 99%` | `#fcfcfc` | — | — | 交替浅底面 |
| `--foreground` | `240 3% 6%` | `#0f0f10` | `0 0% 100%` | `#ffffff` | 主文字、主按钮背景、焦点环 |
| `--card` / `--popover` | `var(--background)` | `#ffffff` | `var(--background)` / `--tw-gray-900` | `#0f0f10` / `#2e2e2e` | 卡片 / 浮层表面 |
| `--primary` | `var(--gray-900)` | `#2e2e2e`（实测按钮多用 `foreground` `#0f0f10`） | `210 20% 98%` | `#f9fafb` | 主强调控件 |
| `--primary-foreground` | `210 20% 98%` | `#f9fafb` | `220.9 39.3% 11%` | `#111827` | 主按钮文字 |
| `--secondary` | `var(--darken-500)` | `rgba(0,0,0,0.53)` | `var(--lighten-600)` | `rgba(255,255,255,0.64)` | 次级文字、描述、未激活 Tab |
| `--subtle` | `var(--darken-450)` | `rgba(0,0,0,0.44)` | `var(--lighten-500)` | `rgba(255,255,255,0.53)` | 辅助分组小标题、弱提示 |
| `--muted` | `var(--darken-100)` | `rgba(0,0,0,0.043)` | `var(--lighten-100)` | `rgba(255,255,255,0.043)` | 选中项底色、轻量胶囊底色 |
| `--accent` | `var(--gray-100)` | `#e3e3e3` | `215 27.9% 16.9%` | `#1f2937` | 强调交互态背景 |
| `--border` | `var(--gray-alpha-150)` | `rgba(0,0,0,0.075)` | `var(--gray-alpha-150)` | `rgba(255,255,255,0.075)` | 全局默认 1px 分隔线与控件描边 |
| `--input` | `220 13% 91%` | `#e5e7eb` | `215 27.9% 16.9%` | `#1f2937` | 兼容表单边框基准 |
| `--ring` | `224 71.4% 4.1%` | `#030712` | `216 12.2% 83.9%` | `#d1d5db` | 焦点环基准 |
| `--destructive` | `0 84.2% 60.2%` | `#ef4444` | `0 62.8% 30.6%` | `#7f1d1d` | 危险/删除操作 |
| `--sidebar-background` | `0 0% 98%` | `#fafafa` | `240 5.9% 10%` | `#18181b` | 左侧导航栏底色 |
| `--sidebar-foreground` | `240 5.3% 26.1%` | `#3f3f46` | `240 4.8% 95.9%` | `#f4f4f5` | 侧边栏次级文本 |
| `--sidebar-accent` | `240 4.8% 95.9%` | `#f4f4f5` | `240 3.7% 15.9%` | `#27272a` | 侧边栏悬浮底色 |

### 3.2 21 阶纯中性灰阶（`--tw-gray-*` 与 `--gray-*` 自动反转）

ElevenLabs 扩展了 Tailwind 默认的 11 阶灰阶，在每百位之间增加了半阶（`75, 150, 250, 350, 450, 550, 650, 750, 850, 925`），色相与饱和度均为 `0`（纯中性灰），且 `--gray-N` 在 `.dark` 下自动对称映射为 `--tw-gray-(1000-N)`：

| 阶数 | 原始 HSL | Hex | 典型使用场景 |
| --- | --- | --- | --- |
| `50` | `0 0% 98%` | `#fafafa` | 侧边栏背景、快捷键键帽底色 |
| `75` | `0 0% 93%` | `#ededed` | 分段 Tab 容器背景 |
| `100` | `0 0% 89%` | `#e3e3e3` | 禁用主按钮文字、次级按钮底色 |
| `150` | `0 0% 85%` | `#d9d9d9` | 浅灰分隔/骨架底 |
| `200` | `0 0% 81%` | `#cfcfcf` | 滚动条滑块、次级按钮悬浮态、内描边 |
| `300` | `0 0% 72%` | `#b8b8b8` | 弱图标/占位元素 |
| `400` | `0 0% 64%` | `#a3a3a3` | 禁用态实心按钮背景（如未输入时的 Send 钮） |
| `500` | `0 0% 55%` | `#8c8c8c` | 中灰基线（Light/Dark 不变点） |
| `600` | `0 0% 46%` | `#757575` | 中深灰辅助信息 |
| `700` | `0 0% 36%` | `#5c5c5c` | 次要正文 |
| `800` | `0 0% 27%` | `#454545` | 次级按钮文字、提示芯片文字 |
| `900` | `0 0% 18%` | `#2e2e2e` | Dark 模式 Popover 底色 / Light Primary |
| `925` | `0 0% 13%` | `#212121` | Light 模式 Toast 深色玻璃底色（`85%` 透明度） |
| `950` | `0 0% 9%` | `#171717` | 极深灰表面 |

### 3.3 21 阶光学 Alpha 色阶（`--gray-alpha-*`）

Light 模式映射 `--darken-*`（纯黑透明），Dark 模式自动映射 `--lighten-*`（纯白透明）：

| 常用阶数 | Light (`--tw-darken-*`) | 透明度 | 实测高频用途 |
| --- | --- | --- | --- |
| `50` | `#00000005` | `2.0%` | 空状态卡片背景、Pricing 卡片底部区块、列表选中悬浮 |
| `75` | `#00000008` | `3.1%` | 极微弱容器底色 |
| `100` | `#0000000b` | `4.3%` | 侧边栏当前激活项背景、`Alpha` 胶囊徽章、表格极浅底线、代码块底色 |
| `150` | `#00000013` | `7.5%` | **全局默认边框 `--border`**（侧边栏右线、顶栏底线、搜索框、卡片描边） |
| `200` | `#0000001a` | `10.2%` | 次级按钮描边、下拉选择器描边、快捷创建瓷砖描边 |
| `300` | `#00000029` | `16.1%` | 强调型筛选芯片描边、轮播指示点未激活态 |
| `450` | `#00000070` | `43.9%` | `--subtle`：弱化分组标题（`Recent chats`、`Checklist`） |
| `500` | `#00000087` | `52.9%` | `--secondary`：描述文本、搜索占位符、未激活 Tab、图标默认色、键帽文字 |
| `600` | `#000000a4` | `64.3%` | 媒体播放按钮图标 |
| `800` | `#000000cd` | `80.4%` | 底线 Tab 激活下划线（`1.5px`） |

### 3.4 功能专用语义色（Chart / Toast / Audio / Collection）

- **图表色（Chart）**：
  - Primary：描边 `hsl(224 100% 51%)`（`#0548ff`，Dark `55%` L），填充 `hsl(224 100% 98%)`（Dark `10%` L）
  - Success：描边 `hsl(140 100% 40%)`（`#00cc44`，Dark `45%` L），填充 `hsl(140 100% 98%)`
  - Error：描边 `hsl(1 100% 51%)`（`#ff0905`，Dark `55%` L），填充 `hsl(1 100% 98%)`
  - Unknown：描边 `hsl(0 0% 55%)`，填充 `hsl(0 0% 98%)`
- **Toast 玻璃态通知（永远深色胶囊）**：
  - 表面 `--toast-surface`：`hsl(var(--tw-gray-925) / 0.85)`（Dark 为 `gray-850 / 0.85`）
  - 标题 `--toast-title`：`hsl(var(--tw-gray-50))`；描述 `--toast-description`：`var(--lighten-700)`
  - 7px 状态圆点（CIE `lab()` 色彩空间 + `3px` 15% 光晕）：
    - Default：`lab(67.49% -0.51 -3.73)`
    - Info：`lab(67.37% -5.79 -24.23)`
    - Success：`lab(70.76% -21.27 12.54)`
    - Warning：`lab(72.18% 9.01 31.65)`
    - Error：`lab(62.12% 24.80 13.64)`
- **语音/工作流专用色**：
  - Audio Tag（TTS 表现力标签如 `[laughs]`）：`hsl(293 53% 52%)`（`#b644c5`）
  - Audio Tag v4：`hsl(6.7 95.3% 66.9%)`（`#fb6c5a`）
  - Flow 标记点：Input `rgb(231 110 0)` / Output `rgb(130 158 0)`
  - 收藏夹低饱和色系 `--collection-{blue,green,orange,purple,red,teal,yellow}-{100,500,900}`：饱和度克制在 `11%–30%` 之间，保证不喧宾夺主。

---

## 4. 字体与排印规范（Typography）

### 4.1 字体族定义（`@font-face` 实测）

| 角色 | CSS 字体族 / 类名 | 加载字重 | 使用定位 |
| --- | --- | --- | --- |
| **主 UI / 正文字体** | `Inter, "Inter Fallback", sans-serif` (`.font-sans`) | `100–900`（Variable Font，含斜体） | 95% 以上界面文本：导航、按钮、表单、表格、正文、标签 |
| **品牌展示标题** | `var(--font-waldenburg)` (`Waldenburg`) | `400 / 500 / 700` | 页面主标题 `h1`、AI 欢迎 Hero、推广卡片大标题 |
| **强调副标题** | `var(--font-waldenburg-ht)` (`WaldenburgHF`) | `700`（实测渲染用 `500–600`） | 空状态标题（`No results` / `No documents found`）、特性公告小标题 |
| **无障碍/衬线备选** | `Hyperlegible, serif` (`.font-serif`) | `400 / 700`（含斜体） | 长文本阅读 / 特殊可读性场景 |
| **波形图标字体** | `wavefont` | — | 音频波形可视化渲染 |

### 4.2 实测排印层级表

| 语义层级 | 字体 | 字号 / 行高 | 字重 | 字距（Tracking） | 颜色 | 典型出现位置 |
| --- | --- | --- | --- | --- | --- | --- |
| **Hero Prompt 标题** | `Waldenburg` | `28px / 36px` | `400` | `-0.21px` | `#0f0f10` | Creative Home (`How can Producer help you`) |
| **页面主标题 (`h1`)** | `Waldenburg` | **`24px / 30px`** | **`400`** | **`-0.15px`**（问候语 `-0.6px`） | `#0f0f10` | 全部 12+ 工作区页头（Agents / History / KB / Voices / Studio / Music / Developers / Subscription） |
| **工作区模块标题 (`h2`)** | `Inter` | `18px / 24px` | `600` | `-0.045px` | `#0f0f10` | Developers (`Build with ElevenAPI`、`Spend`) |
| **功能公告小标题** | `WaldenburgHF` | `18px / 26px` | `500` | `-0.045px` | `#0f0f10` | Sound Effects 公告条 |
| **空状态 / 卡片标题 (`h4`)** | `WaldenburgHF` | **`16px / 24px`** | **`600`** | `normal` | `#0f0f10` | 全部空状态（`No results` / `No tests found` / `No tools found`） |
| **Prompt / 长文正文** | `Inter` | `16px / 24px–28px` | `400` | `0em` | `#0f0f10` | TTS 编辑器、Music/SFX Prompt 输入、FAQ 标题 |
| **标准 UI / 按钮 / Tab / 输入** | `Inter` | **`14px / 20px`** | **`500`**（正文/占位 `400`） | `0em` | `#0f0f10` / `--secondary` | 36px 按钮、Tabs、搜索框、表单标签、侧边栏分组 |
| **弱化分组标题** | `Inter` | `14px / 20px` | `500` | `0em` | `--subtle` / `--secondary` | `Pinned`、`Recent chats`、`Checklist` |
| **紧凑顶栏按钮 / 工具钮** | `Inter` | **`13px / 20px`** | **`500`** | `0em` | `#0f0f10` | 顶栏 `What's new` / `Feedback` / `Docs` / `Architect` / `Search & create` |
| **筛选芯片 / 微标签** | `Inter` | `12px / 16px` | `500` | `0.0025em` (`0.03px`) | `#0f0f10` | `Agent` / `Type` 筛选芯片、Unpin 按钮、次级角标 |
| **快捷键键帽 (`⌘ K`)** | `Inter` | `11px / 20px` | `500` | `0em` | `--secondary` | 搜索栏右侧快捷键提示 |
| **微胶囊徽章** | `Inter` | `10px / 16px` | `500` | `0.0025em` | `#0f0f10` | `Alpha` / `Beta` 状态徽章 |

> **移动端响应式缩放规则（CSS 实测）**：在 `max-sm` 下自动收缩字号变量：`--fontSize-xl: 1.125rem (18px)`、`--fontSize-sm: 0.8125rem (13px)`、`--fontSize-xs: 0.6875rem (11px)`。  
> **精细中间字重**：CSS 显式使用了 `font-[375]`、`font-[450]`、`font-[550]`，说明团队充分利用了 Inter 可变字体的微调能力。

---

## 5. 空间、布局与页面原型（Layout & Spacing）

### 5.1 全局壳层 CSS 变量（App Shell Geometry）

```css
:root {
  --spacing: 0.25rem;               /* 4px 基础间距单位 */
  --eleven-sidebar-width: 16rem;    /* 256px 左侧固定导航栏 */
  --eleven-header-height: 3.125rem; /* 50px 桌面顶栏；窄容器下扩展为 6.25rem (100px) */
  --eleven-banner-height: 0rem;     /* 有顶部黑底活动横幅时为 2.5rem (40px) */
  --eleven-player-height: 0rem;     /* 底部音频播放器激活时动态增高 */
  --eleven-footer-height: 0rem;
}
```

### 5.2 断点与容器宽度

- **Breakpoints**：`2xs: 375px` · `xs: 480px` · `sm: 640px` · `md: 768px` · `lg: 1024px` · `xl: 1280px` · `2xl: 1536px` · `3xl: 1980px`
- **主工作区容器（Agents 列表/历史/知识库等）**：
  - `w-full max-w-screen-2xl (1536px) mx-auto`
  - 基于 `@container` 的渐进内边距：`px-4 pt-4`（`16px`）→ `@xl: px-6 pt-6`（`24px`）→ `@4xl: px-14 pt-14`（**`56px`**）
- **阅读/信息密集型页面（Developers / Subscription）**：
  - `max-w-6xl (1152px) mx-auto pb-8`
  - 区块垂直间距：`gap-8`（`32px`，Developers）或 `gap-6`（`24px`，Subscription）；区块标题下方间距：`mb-4`（`16px`）。

### 5.3 五大标准页面原型

1. **AI 对话/创作居中型**（`/app/agents`、`/app/home`、`/app/studio`、`/app/music`）
   - 垂直留白充足 + 居中 `Waldenburg` 引导标题 + 悬浮大圆角 Prompt 盒（宽 `650px–812px`）+ 下方药丸快捷建议芯片 + 折叠式历史/清单或模板瀑布流。
2. **资源 CRUD 管理列表型**（`/app/agents/agents`、`history`、`knowledge-base`、`tools`、`agent-testing`、`triage`）
   - `50px` 顶栏（面包屑/页面名 + 右侧 `What's new` / `Feedback` / `Docs` / `Architect`）→ 页面头部（左侧 `24px` `h1` + 右侧次级/主 CTA）→ 可选快捷创建瓷砖行或 Tabs → 全宽 `40px` 搜索框 + 筛选芯片栏 → 表格或空状态盒。
3. **双栏专业编辑器型**（`/app/speech-synthesis/text-to-speech`）
   - 左侧高自由度无边框创作画布（`padding: 48px`），右侧固定 `500px` Inspector 面板（左侧 `1px var(--gray-alpha-150)` 分隔线 + 顶部 `44px` 底线 Tabs `Settings / History`）。
4. **发现与筛选网格型**（`/app/voice-library`、`/app/sound-effects`）
   - 顶部大搜索框（`40px`）+ 右侧筛选触发器 + 水平滚动分类胶囊栏 + 多列媒体/声音卡片（`16px–20px` 圆角）与浮动翻页圆钮。
5. **开发者与计费控制台型**（`/app/developers`、`/app/subscription/agents`）
   - `1152px` 居中单栏流、CLI 灰色命令复制条、带微阴影的数据面板卡片（`14px–16px` 圆角）、横向滚动定价卡片与无竖线极简对比表。

---

## 6. 圆角、边框与多阶阴影系统（Radius, Border & Elevation）

### 6.1 圆角体系

| Token / 实测值 | 像素值 | 典型应用组件 |
| --- | --- | --- |
| `--radius-sm` | `2px` | `btn-xs`（极小旧控件） |
| `--radius-default` | `4px` | 极小角标 |
| `--radius-md` | `6px` | 快捷键键帽 `⌘ K`、复选框 `20×20`、微图标钮 `22px` |
| `--radius-lg` / `--radius` | `8px` | 侧边栏导航项、筛选芯片 `24px`、分段开关子项、Toast 默认半径 |
| **自定义中间档** | **`9.6px–10px`** | **高频按钮标准圆角**（顶栏 `32px` 钮 `9.6px/10px`、主/次 `36px` 钮 `10px`、分段 Tab 外壳 `10px`、侧边栏激活态 `10px`） |
| `--radius-xl` | `12px` | 搜索输入框 `40px`、筛选下拉钮 `40px`、空状态盒、CLI 命令条、Pricing 卡片、Quick tip 提示卡 |
| **卡片中间档** | `14px` | 侧边栏推广卡（`Invite team members`）、Developers 数据卡 |
| `--radius-2xl` | `16px` | 快捷创建大瓷砖（`80px`）、Recent chats 列表容器、Credits 进度卡、Studio 特性卡、Voice 卡片、右侧抽屉圆角 |
| **创作容器档** | `20px–26px` | Music Prompt 盒（`20px`）、Agents Architect Prompt 盒（`24px`）、Creative Home 横幅（`24px`）、Producer 单行 Prompt 栏（`26px`） |
| `--radius-full` | `9999px` | 建议药丸芯片、圆形播放/发送按钮、`Alpha` 徽章、翻页圆钮 |

### 6.2 边框规范

- **全局默认边框**：`.rebrand-body * { border-color: var(--gray-alpha-150); }`（`1px solid rgba(0,0,0,0.075)`）。
- **交互强调边框**：次级按钮与下拉触发器采用 `var(--gray-alpha-200)`（`rgba(0,0,0,0.10)`）；输入框聚焦时收紧为 `1px solid #0f0f10` + `0 0 0 0.5px #0f0f10` 锐利黑边。
- **极简无竖线原则**：数据表与设置行几乎不使用垂直网格线，仅靠 `1px solid var(--gray-alpha-100)`（`4.3%`）水平分割线区分行。

### 6.3 物理多阶自然阴影体系（核心视觉签名）

ElevenLabs App 的阴影分为三套：

1. **自然阶梯阴影（`shadow-natural-*`，用于 Prompt 盒、悬浮卡、Popovers）**：
   始终以 `0 0 0 1px rgba(0,0,0,0.06)` 模拟发丝描边，再按 `1 → 3 → 6 → 12 → 24 → 48px` 指数级扩散，负 spread 消除边缘脏感：
   - **`shadow-natural-xs`**（侧边栏推广卡、浮动翻页圆钮）：
     ```css
     0 0 0 1px #0000000f,
     0 1px 1px -0.5px #0000000f,
     0 3px 3px -1.5px #0000000f
     ```
   - **`shadow-natural-sm`**：在 `xs` 基础上增加 `0 6px 6px -3px #0000000f, 0 12px 12px -6px #00000005`
   - **`shadow-natural-md`**（Agents Architect Prompt 盒、Music Prompt 盒）：
     ```css
     0 0 0 1px #0000000f,
     0 1px 1px -0.5px #0000000f,
     0 3px 3px -1.5px #0000000f,
     0 6px 6px -3px #0000000f,
     0 12px 12px -6px #0000000a,
     0 24px 24px -12px #0000000a
     ```
   - **`shadow-natural-lg`**：再叠加 `0 48px 48px -24px #00000005`
2. **发丝轮廓卡片阴影**（Subscription Credits 卡、Pricing 套餐卡、黑底营销横幅）：
   ```css
   0 0 1.072px 0 rgba(0, 0, 0, 0.4),
   0 2px 4px 0 rgba(0, 0, 0, 0.04)
   ```
3. **玻璃态 Toast 6 层光学阴影（`--toast-shadow`）**：
   顶部内高光 + 内描边 + 外轮廓 + 两级投影：
   ```css
   inset 0 0.5px 0 var(--lighten-400),
   inset 0 0 0 0.5px var(--lighten-150),
   inset 0 -0.5px 0 var(--lighten-100),
   0 0 0 0.5px var(--darken-450),
   0 2px 6px -2px var(--darken-250),
   0 18px 40px -10px var(--darken-400)
   ```
4. **标准浮层阴影（`shadow-lg`，Quick tip、右侧抽屉）**：
   `0 4px 6px -2px rgba(16,24,40,0.03), 0 12px 16px -4px rgba(16,24,40,0.08)`

---

## 7. 图标、交互态与动效规范

### 7.1 图标栅格（跨 17 页 SVG 实测统计）

ElevenLabs **不采用**传统的 `16px / 24px` 图标阶梯，而是高度统一为 **`18px` 主力 + `14px` 辅助 + `20px` 强调**：

| 尺寸 | 跨页出现频次 | 用途 |
| --- | --- | --- |
| **`18×18px`** | **511 次** | 侧边栏导航图标、标准按钮图标、搜索框前置图标、操作栏图标 |
| **`14×14px`** | **231 次** | 下拉箭头、微芯片图标、外链箭头、关闭/置顶微动作 |
| **`20×20px`** | **115 次** | 快捷创建瓷砖图标、大号媒体控制图标、顶部提醒图标 |
| `109×18px` | 17 次 | 左上角 `ElevenLabs` 品牌 Wordmark |

### 7.2 键盘焦点环（`.focus-ring`）

```css
.focus-ring:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px hsl(var(--background)),
    0 0 0 3.5px hsl(var(--foreground)); /* 2px 留白 + 1.5px 极清黑/白环 */
}
```

### 7.3 特色交互下划线（`.underline-hint`）

所有内联文本链接（如 `usage settings`）使用可避让字母下伸部（descender cutout）的渐变下划线：
- 静息态填充强度 `--uhint-fill: 40%`，悬停 / 展开 / 聚焦时平滑升至 `100%`；
- 根据所在背景自动匹配 `--underline-cutout`（如 `background` / `gray-50` / `popover`）。

### 7.4 动效曲线与节奏

- 默认过渡曲线：`cubic-bezier(0.4, 0, 0.2, 1)`（Tailwind `--ease-in-out`）
- 钻取/层级切换动画（`--animate-drill-down-forward` / `back`）：`180ms cubic-bezier(0.32, 0.72, 0, 1)`（类 iOS 干脆减速曲线，无回弹）
- 加载脉冲/边界流光：`border 4s linear infinite`、`shimmer-angle: 20deg`

---

## 8. 核心组件规范（Component Specifications）

### 8.1 左侧导航栏（Sidebar）

- **容器**：固定宽 `256px`（`16rem`），背景 `#fafafa`（`--sidebar-background`），右边框 `1px solid var(--gray-alpha-150)`。
- **顶部结构**：`ElevenLabs` Logo（`109×18px`）+ 平台切换器按钮（`h=32px, r=8px`，如 `ElevenAgents` / `Creative Platform`）+ 全局搜索入口 `Search & create ⌘ K`（`h=32px, r=12px, bg=#fff, border=1px rgba(0,0,0,0.1)`）。
- **导航项**：
  - 高 `32px`，宽 `231px`（左右内缩 `12px`），左图标 `18×18px`。
  - 默认态：透明底，`#0f0f10` 文字，`r=8px`。
  - 激活态：`bg=rgba(0,0,0,0.043)`（`--darken-100`），`r=10px`，字体保持克制不加粗突兀。
  - 分组标题（如 `Pinned`）：`Inter 14px/20px w500`，颜色 `rgba(0,0,0,0.53)`；可悬浮出现 `22px` Unpin 微动作钮。
- **底部区域**：固定工具入口（`Workspace settings`、`MCP and API`）+ `Upgrade` 条（`h=32px`）+ 可关闭团队邀请推广卡（`231×112px, r=14px, pad=10px, bg=#fff, shadow-natural-xs`）。

### 8.2 顶部栏（Top Header）

- **高度**：`50px`（`3.125rem`），透明底，底边框 `1px solid var(--gray-alpha-150)`。
- **右侧功能组**：标准高度 `32px`，以 `What's new` / `Feedback` / `Docs` / `Architect` 次级白底描边钮（`r=9.6px–10px, pad=0 10px, 13px w500`）+ `32×32px` 通知图标钮 + `37×40px` 用户头像组成。

### 8.3 按钮系统（Button Matrix）

| 变体 | 高度 | 圆角 | 内边距 | 背景 / 文字 / 边框 | 字体 | 典型场景 |
| --- | --- | --- | --- | --- | --- | --- |
| **Primary Solid** | `36px` | `10px` | `0 12px` | `#0f0f10` / `#ffffff` / 无 | `Inter 14px/20px w500` | 页面主 CTA（`New agent`、`Create a test`） |
| **Primary Circle** | `32px / 36px` | `9999px` | `0` | `#0f0f10` / `#ffffff`（禁用 `#a3a3a3` / `#e3e3e3`） | 图标居中 | 发送 Prompt、播放语音、创建项目 |
| **Secondary Outline (MD)** | `36px` | `10px` | `0 12px` | `#ffffff` / `#0f0f10` / `1px rgba(0,0,0,0.1)` + 微影 | `Inter 14px/20px w500` | `Create Folder`、`Add webhook`、`Upgrade` |
| **Secondary Outline (SM)** | `32px` | `9.6px / 10px` | `0 10px` | `#ffffff` / `#0f0f10` / `1px rgba(0,0,0,0.1)` + 微影 | `Inter 13px/20px w500` | 顶栏按钮、`Copy prompt`、`Architect` |
| **Filter Select Trigger** | `40px` | `12px` | `0 12px` | 透明或 `#fff` / `#0f0f10` / `1px rgba(0,0,0,0.075–0.1)` | `Inter 14px/20px w400–500` | `Genre`、`Language`、`Trending` 筛选下拉 |
| **Ghost / Icon Only** | `32px / 36px` | `8px / 10px / 9999px` | `0` | 透明 / `rgba(0,0,0,0.53)` / 无 | `Inter 13–14px w500` | `More`、翻页、语音听写、更多菜单 |
| **Suggestion Pill** | `32px` | `9999px` | `0 14px` | `#ffffff` / `rgba(0,0,0,0.53)` / `1px rgba(0,0,0,0.075)` | `Inter 14px/20px w500` | AI 建议芯片（`Create new agent`、`Connect channel`） |
| **Action Tile Card** | `80px` | `16px` | `16px 16px 12px` | 半透白 / `#0f0f10` / `1px rgba(0,0,0,0.1)` | `Inter 14px/20px w500` | KB/Tools 顶部的 `Add URL`、`Add Files`、`Add webhook tool` |

### 8.4 搜索框与输入控件（Inputs & Prompt Composer）

- **标准列表搜索框**：高 **`40px`**（紧凑区 `36px`），圆角 **`12px`**，内边距 `8px 12px 8px 36px`（左侧留给 `18px` 放大镜图标），边框 `1px solid var(--gray-alpha-150)`，字体 `Inter 14px/20px w400–500`。聚焦时边框切换为 `1px solid #0f0f10` + `0.5px` 外环。
- **AI Prompt Composer（核心差异化组件）**：
  - Agents Architect：`812×166px`，`r=24px`，纯白底 + `shadow-natural-md`，内部上方无边框 `contenteditable`（`Inter 14px/24px`），底部工具条左右排布模式胶囊（`Approval required`、`Lite`）与圆形语音/发送按钮（`32×32px`）。
  - Creative Producer 单行形态：`650×52px`，`r=26px`，三层轻影叠加，右侧 `36×36px` 圆形发送按钮。
  - Music 复合形态：`700×237px`，`r=20px`，顶部 `56px` 为 `rgba(0,0,0,0.043)` 参数区，下方以 `1px var(--gray-alpha-150)` 分隔的歌词/提示输入区。

### 8.5 双模式标签页（Tabs）

ElevenLabs 严格区分两种 Tab，不混用场景：

1. **分段胶囊 Tab（Segmented Tabs）** — 用于视图/配置切换（如 Studio `Tools | Examples`、History、Settings）：
   - 轨道：`h=36px, r=10px, pad=4px, bg=#ededed (gray-75)`
   - 激活项：`h=28px, r=7px, pad=0 12px, bg=#fff, border=1px var(--gray-alpha-150), 微阴影, color=#0f0f10, Inter 14px w500`
   - 未激活项：透明底，`color=rgba(0,0,0,0.53)`
   - （紧凑内联切换如 Developers `Dollars | Credits` 使用 `h=24px, r=8px` 白底微影滑块）
2. **底线 Tab（Underline Tabs）** — 用于面板/列表内容维度切换（如 TTS Inspector `Settings | History`、Studio `All | Video | Audio`）：
   - 轨道：`h=44px`，底边框 `1px solid var(--gray-alpha-150)`
   - 激活项：底边框 **`1.5px solid rgba(0,0,0,0.804)`**（`--darken-800`），文字 `#0f0f10`，`Inter 14px/20px w500`
   - 未激活项：透明底边，文字 `rgba(0,0,0,0.53)`

### 8.6 徽章、筛选芯片与快捷键键帽

- **状态微徽章（`Alpha`）**：`h=20px, r=9999px, pad=0 6px, bg=rgba(0,0,0,0.043), color=#0f0f10, Inter 10px/16px w500`。
- **筛选芯片（`Agent` / `Type`）**：`h=24px, r=8px, bg=#fff, border=1px var(--gray-alpha-150), color=#0f0f10, Inter 12px/16px w500`。
- **快捷键键帽（`⌘` / `K`）**：`20×18px, r=6px, pad=0 4px, bg=#fafafa, border=1px rgba(15,15,16,0.15), color=rgba(0,0,0,0.53), Inter 11px/20px w500`。

### 8.7 空状态组件（Empty State）

全站列表页（History / Knowledge Base / Tools / Tests）采用 100% 一致的空状态卡片：
- **外盒**：全宽，`min-height: 170–194px`，`bg=rgba(0,0,0,0.02)`（`--darken-50`），`border=1px solid var(--gray-alpha-150)`，`r=12px`，`padding: 24px`，居中垂直排布。
- **标题**：`WaldenburgHF 16px/24px w600`，`#0f0f10`。
- **说明**：`Inter 14px/20px w400`，`rgba(0,0,0,0.53)`。

### 8.8 表单微件（Checkbox / Radio / Table）

- **复选框（Checklist）**：`20×20px, r=6px, bg=#fff, border=1px var(--gray-alpha-150)`，带轻微投影。
- **数据表（Developers / Subscription）**：无外框与竖线，表头 `Inter 14–16px w700`（高 `24–38px`），数据行底线用极淡 `rgba(0,0,0,0.043)`，保持低视觉噪声。

---

## 9. 对 Libitu 演进的可借鉴要点

如果将 ElevenLabs App 的工程化设计体系作为参考来优化 Libitu（需遵循 [`Libitu_Design_Spec.md`](./Libitu_Design_Spec.md) 与 [`DECISIONS.MD`](../../DECISIONS.MD) 的既有边界，不破坏 Libitu 的学习语义色与既有布局）：

1. **Alpha 边框与表面色阶最值得直接借鉴**：用 `2% / 4.3% / 7.5% / 10%` 四档透明黑替代手写散落的十六进制浅灰边框，能让卡片、输入栏、悬浮层在不同背景面下天然协调，且未来接入 Dark Mode 几乎零改造成本。
2. **明确区分“产品工作台”与“营销官网”**：ElevenLabs 自己在 `/app/*` 里刻意收起了官网的大药丸按钮和 `w300` 超细标题，改为 `10px/12px` 实用圆角、`32/36/40px` 清晰控件高度梯队和 `18px/14px` 统一图标体系。
3. **双模式 Tabs 的语义边界清晰**：容器内视图切换用“灰底白块 Segmented Tabs”，面板级/Inspector 级切换用“1.5px 黑底线 Underline Tabs”，比单一样式更容易建立信息层级。
4. **物理多阶阴影只给最核心的交互焦点**：常规列表、设置卡片保持 `1px` 极淡边框零阴影；仅把 `shadow-natural-md` 留给核心 Prompt/录音/悬浮操作台，视觉重心会立刻聚焦。

> **已采纳并同步至 Libitu 规范（2026-11-24）**：上述要点已结合 Libitu 既有边界落地并同步至 [`packages/ui/src/tokens.css`](../../packages/ui/src/tokens.css)、[`libitu_设计规范_v2_1_统一版_.md`](./libitu_设计规范_v2_1_统一版_.md)、[`VISUAL_SYSTEM.md`](./VISUAL_SYSTEM.md)、[`BUTTON_SYSTEM.md`](./BUTTON_SYSTEM.md)、[`Libitu_Design_Spec.md`](./Libitu_Design_Spec.md) 与 [`DECISIONS.MD`](../../DECISIONS.MD)（包括光学中性 Alpha 阶梯、多阶自然阴影、双模式 `Tabs`/`SegmentedControl`、`EmptyState`、悬浮 `Composer`、暗色毛玻璃 `Toast`，以及操作按钮 `10px` 默认圆角与 `32/36/42px` 尺寸阶梯）。本文档仍保持外部产品实测参考性质，后续开发以 Libitu 规范与共享 token 为准。
