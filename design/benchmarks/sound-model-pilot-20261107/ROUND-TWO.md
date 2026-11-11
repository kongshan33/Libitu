# 第二轮：三处复核与补充目标样本

用户要求准备 `letter`、`And you`、`etc.` 三处复核片段和补充录音，供同一位标注者再听一轮。本包有 **12 个目标项：3 个复核、9 个新增，词内闪音／融合同化／鼻音部位同化各 4 项**。每项只判断明确的词位，不再要求整句遍历三类。

入口：<http://127.0.0.1:8767/review.html>。离线文件为 `.cache/sound-pilot/round-two/review.html`；可分享的本地 ZIP 为同目录 `listening-pack.zip`，解压后打开 `review.html` 即可使用。ZIP 不含模型输出、上一轮人工答案、私有身份映射或模型推理清单。

## 给标注者

1. 填写标注代号，例如 A。每项先听整句，确认高亮词确实出现，再用“听局部”重复听；需要时可慢放、循环，最终回到原速判断。
2. 只判断高亮位置，选择“听到了／未听到／听不清／目标不适用”。这轮的“未听到”明确对应该目标位置，不再表示整句扫描结果。
3. 说明可留空，不用填写词编号或秒数。`etc.` 先确认实际说出的内容；与原文不符时可选择不适用并记下实际内容。
4. 局部截取不合适时回听整句，并勾选相应选项。自动截取并不是已经由人确认的音素边界。
5. 随时导出 JSON，未填项保持 pending。下载没有反应时展开“显示可复制的备份文本”，复制完整 JSON 保存。可从本轮 JSON 恢复；首轮文件会被拒绝，防止混包。

页面没有预选判断，不展示模型结果、前一轮判断或发音评分。同人复核仍不是独立第二位标注者的盲审，不能据此宣布已仲裁金标或泛化准确率。

## 冻结的目标清单

以下类别与语境用于确定听辨位置，**不是实际发生标签**。阴性、阳性、混淆和无法判断由真人听辨后确定，没有为凑类别而预造阳性或阴性。

| 页面项 | 来源阶段 | 高亮位置 | 检查语境 |
|---|---|---|---|
| 01 | 复核 | letter | 词内 /t/ 闪音 |
| 02 | 复核 | And you | /d/ + /j/ 融合 |
| 03 | 复核 | etc. | 先核对实际展开形式，再检查词内 /t/ |
| 04 | 新增 | OWN PROJECTS | /n/ 在双唇音 /p/ 前 |
| 05 | 新增 | One by | /n/ 在双唇音 /b/ 前 |
| 06 | 新增 | One guess | /n/ 在软腭音 /g/ 前 |
| 07 | 新增 | Would you | /d/ + /j/ 融合 |
| 08 | 新增 | Don't you | /t/ + /j/ 融合，省略 /t/ 不自动算融合 |
| 09 | 新增 | Won't you | /t/ + /j/ 融合，保留或省音也是替代实现 |
| 10 | 新增 | BETTER | 词内 /t/ 闪音 |
| 11 | 新增 | body | 词内 /d/ 闪音 |
| 12 | 新增 | in California | /n/ 在软腭音 /k/ 前 |

全部是真人原始录音：10 条 CMU ARCTIC、2 条 speechocean762；仍为此前四位成年说话人的开发样本，没有新增独立测试说话人。GA 是学习目标，不据此推断学习者已经具有 GA 口音。原句共 34.8884 秒；默认整句回听，10 个局部上下文加 2 个完整短句共 16.5179 秒。没有生成 TTS 充当真实发音证据，本轮新增录音尚未跑 ZIPA / Allophant。

## 片段与来源身份

- `round-two-selection.json` 固定所选原文、词位、类别与复核／新增身份；`round-two-sources.lock.json` 固定 12 个 WAV 和 20 个对齐侧文件的来源、大小、SHA-256。
- 三个复核项复用原始种子的相同 WAV 字节。新增源文件保存在 `.cache/sound-pilot/round-two-sources/`；CMU 非版本化 URL 以本次字节哈希冻结，恢复下载不接受内容静默变化。speechocean762 使用原种子的固定 Git revision。
- CMU `festival/utts` 的 Token → SylStructure → Segment 关系用于定位词范围，并与 `lab` 的音段名、结束时间逐一交叉核对。使用记录音频的 `end`，不使用合成音的 `source_end` 或 Unit 时间。
- 目标前后各保留最多 350ms，按原始 PCM 帧截取；不调增益、不降噪、不重采样、不拉伸。完整 WAV 同时保留。所选两条学习者录音没有该来源对齐文件，直接保留完整 3 秒左右的短句，没有按词数平均猜边界。
- 自动对齐可能把真实发音解释为字典目标，因此它仅用于播放窗口。对齐音素不会被当作声学现象证据或人工标签，也不显示在听辨页面。
- 来源版权、作者信息与完整许可随包保留，`AUDIO-NOTICE.txt` 明确标记截取修改；项目仍限定 benchmark_only、training_allowed=false。

## 实现与恢复

`round_two.py` 只读取源清单、许可和对齐侧文件，构建独立包；不读取首轮人工标签或模型输出。`target_review.html` 使用新的包 ID 与包 SHA 作为暂存命名空间，不覆盖首轮填写。导出格式为 `sound-target-review-v1`，每条绑定原始音频、上下文音频、原文哈希、类别与词位。保存草稿不要求填完；导入会完整核验身份，失败时保留现有填写。

在 `apps/api` 下执行；输出必须使用新目录。已有冻结源文件时不联网；缺文件可显式增加 `--download-missing`，只允许清单中的来源，下载后检查原 SHA-256。

```sh
.venv/bin/python -m scripts.sound_pilot.round_two \
  --selection ../../design/benchmarks/sound-model-pilot-20261107/round-two-selection.json \
  --lock ../../design/benchmarks/sound-model-pilot-20261107/round-two-sources.lock.json \
  --source-root ../../.cache/sound-pilot/round-two-sources \
  --licenses-root benchmarks/acoustics/v1/public_seed \
  --output ../../.cache/sound-pilot/round-two-new

.venv/bin/python -m scripts.sound_pilot.target_review_check \
  ../../.cache/sound-pilot/round-two/pack.json /absolute/path/to/round2-export.json
```

在仓库根目录启动本机服务：

```sh
python3 -m http.server 8767 --bind 127.0.0.1 --directory .cache/sound-pilot/round-two
```

此服务只监听本机；手机视口验收不意味着手机能用其自身 localhost 打开电脑上的服务。离线 ZIP 可复制到其他设备；各浏览器的暂存独立，需用导出文件转移。

## 验证记录

源 WAV 与派生片段逐项核验 SHA-256、PCM 字节切片、采样率和长度；3 个复核项与首轮原始音频一致。新增 16 项测试，与此前 pilot 测试合计 43 项通过，覆盖自动对齐交叉核验、合成时间隔离、越界/NaN 裁剪、跨包/跨音频/跨词位导入拒绝、pending 保留与单人复核不转金标。

- Chromium 1400×1000 / 390×844：24 次整句／局部播放均进入实际播放状态，导航不会自动播放；慢速、循环、切换后保留判断、刷新恢复、空白草稿下载、键盘 Enter 导出、同包导入恢复均通过。错误的首轮文件被拒绝且当前填写保留。
- 手机播放按钮调整为两列，实际检查两行位置与无横向溢出；最终截图位于 `output/playwright/sound-round2-final-{desktop,mobile}.png`。这是视口模拟，没有物理手机或实际屏幕阅读器验收。
- 页面载入后断网，嵌入音频仍可播放、草稿仍可下载。模拟下载 API 不可用时，完整 12 项 JSON 备份自动展开；已验证空项不丢失。自动化浏览器禁止直接访问 file 协议，因此没有把“断网播放已加载页面”写成“直接双击本地 HTML 已实测”。
- 生成的 ZIP 完整性检查通过，内嵌页面与已验收页面逐字节一致，未打入模型或人工答案。3 个旧 WAV 与原种子身份一致，所有局部 PCM 与原始帧切片一致。自动播放测试不构成真人听辨音质或裁剪语义正确性的认证，保留整句按钮和裁剪反馈供用户核查。
- `target_review_check` 验证 QA 导出：1 个模拟 uncertain、11 个 pending，eligible_gold=0，事件时间尚未标注。QA 文件只保存在 `output/playwright/`，不是人工答案。
- 根 `pnpm lint`、`pnpm build` 通过。首次 `pnpm test` 在本机负载异常高时出现 1 个既有声学进程测试失败（`test_pause_resume_and_active_timeout`，子进程清理 PermissionError），其余 2,038 项通过；不把负载认定为已经证明的唯一原因。该文件与新增测试复查 21/21 通过，随后完整根测试通过：API 2,039 项，Web / Extension 成功缓存。保留首轮日志 `.cache/sound-pilot/round-two-test.log`；最终日志 `round-two-test-final.log`，专项复查 `round-two-retest.log`。
- Modern Web Guidance 的 forms 指南用于原生单选组、可见标签、动态状态和移动触控区；遵循 “DO use non-color visual cues” 与 “DO ensure tap targets are at least 48px”。草稿导出独立于正式事件校验，不用校验拦住备份。
