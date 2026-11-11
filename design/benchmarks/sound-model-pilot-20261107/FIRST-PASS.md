# 首轮人工初筛与模型对照

这轮数据支持的结论是：**当前 ZIPA / Allophant 配置不能直接靠输出 `[ɾ]` 来触发 Sound 闪音标记。** 这不是两套模型的最终能力排名，也不是事件召回率为零；目前没有已仲裁、已定位的事件金标。

## 已完成的整理

16 段表单已从用户实际填写的浏览器恢复，原始文件保留在 `.cache/sound-pilot/reviews/A-recovered-20261107-2315/`。用户随后明确确认两点：

- 第 9 段的闪音词位是 `but I'm`，显示编号 2–3，交换格式为 `[1,3)`。只在派生版本修正，不覆盖原来的 2–0。
- “未发生”表示整句没有听到该类别。因此 41 行保存为整句初筛，不要求补造目标词位或理由，也不作为 41 个事件反例。

| 记录类型 | 数量 | 当前用途 |
|---|---:|---|
| 单词范围的阳性观察 | 1 | `letter`，属于词内闪音候选；需目标处复核 |
| 多词范围的阳性观察 | 6 | 单列保存；不能自动纳入本轮词内闪音 |
| 整句未听到的初筛 | 41 | 排查类别覆盖；不是定位到适用语境的阴性事件 |
| 暂不标注 | 2 | 原样保留，不转换成阴性 |

7 条阳性观察分布在 6 个片段。全部来自同一位标注者，没有时间边界。多词选择可能包含上下文，不能仅凭词数断言精确的跨词音变位置。初标之后的模型对照也不构成独立第二轮听辨。

澄清记录与原始初标 SHA-256 绑定；`audit.py` 只应用具有原值、确认值和用户原话的词位修正。标签、理由和空值不代填。严格的目标事件校验器仍单独保留，不会把这份初筛自动提升为金标。

## 模型输出核验

对同一批 16 个原始 WAV，重新核验音频、原文、盲包、样本映射、模型版本以及运行结果身份，并从保存的原始数组重建 greedy CTC 解码。两模型共 32 个片段结果的所有输出头均能重建，数值有限且概率归一化；没有因为忽略其他属性头而只检查最终文本。

| 检查 | ZIPA FP32 | Allophant 最终 inventory |
|---|---:|---:|
| inventory 含 `[ɾ]` | 是 | 是 |
| 16 句中解码出 `[ɾ]` 的句数 | 0 | 0 |
| 含人工阳性观察的 6 句中解码出 `[ɾ]` 的句数 | 0 | 0 |
| tap 属性头解码出 `+` 的句数 | 无该输出头 | 0 |

原始 `[ɾ]` 及 tap 属性分布的整句峰值、峰值帧及排名也已保存。它们是**未校准的 CTC 帧诊断**，不是事件置信度；整句最大值可能位于另一处音，不能用它来验证选中词位。没有把帧号线性换算成假造的音素边界，也没有用这批人工观察调一个能“命中”的阈值。

本地实现核对还确认 Allophant 的属性子集保留原类别顺序，`predict` 默认返回 log probabilities。当前现象并非本次审计中发现的解码标签错位；但这不取代受支持运行环境复现和独立模型评测。

## 三个有限子类的下一步

| 子类 | 当前证据缺口 | 下一项实际工作 |
|---|---|---|
| 词内 T/D 闪音 | 仅 1 处明确词内阳性；本轮直接符号触发路径未获得支持 | 先对 `letter` 做目标处听辨与定位，保留塞音、闪音、侧音/声门等竞争实现；再补同类真实阳性与替代实现。局部特征/事件分类方案需新数据验证 |
| 融合同化 | 文本规则仅命中 `And you`，没有人工阳性 | 将该位置作为目标复核；补含 /t,d/ + /j/ 的实际录音，同时保留分开实现，不由文本预填标签 |
| 鼻音部位同化 | 本批规则没有候选，也没有人工阳性 | 优先补 /n/ + 双唇音、/n/ + 软腭音的真实目标录音；整句有 `[m]` 或 `[ŋ]` 不证明同化 |

已有规则的另一个词内候选是 `etc.`，需先核对实际说出的缩略词展开形式，不能只凭原文拼写确定目标。接下来的同人目标复核只需聚焦这 3 个现有候选，不用重新把 16 句逐类填写一遍。6 个多词范围观察另列扩展研究，不自动扩充本轮词内范围，也不改变产品的 12 类分类。

离线方案仍是“语境确定检查位置 → 独立音频定位 → 保留竞争发音的声学证据 → 单项检测器验证/弃权”。本轮暂不将原始 IPA 或属性峰值接入用户端标记。不训练当前 benchmark_only 音频，不发布泛化准确率。ZIPA 主候选、Allophant 对照的研究身份保留，但不据这批初筛宣布任何模型已适合上线。

## 文件与复现

- 明确确认记录：`.cache/sound-pilot/reviews/A-clarified-20261107/clarifications.json`
- 可导回原页面的派生初标：`.cache/sound-pilot/audits/A-first-pass-20261107-v2/review-clarified.json`
- 分离整句初筛与位置观察：同目录 `observations.json`
- 每句解码、原始数组哈希与帧诊断：同目录 `audit.json`
- 现有 3 处候选的目标复核清单：同目录 `target-review-queue.json`，未预填事件结论

在 `apps/api` 下运行，输出必须使用新目录：

```sh
../../.cache/sound-pilot/venv/bin/python -m scripts.sound_pilot.audit \
  --pack ../../.cache/sound-pilot/review-final/pack.json \
  --mapping ../../.cache/sound-pilot/review-final/private-mapping.json \
  --manifest benchmarks/acoustics/v1/public_seed/manifest.json \
  --audio-root ../../.cache/acoustic-benchmark/public-seed \
  --review ../../.cache/sound-pilot/reviews/A-recovered-20261107-2315/review-A.json \
  --clarifications ../../.cache/sound-pilot/reviews/A-clarified-20261107/clarifications.json \
  --zipa-run ../../.cache/sound-pilot/runs/zipa-fp32-01 \
  --allophant-run ../../.cache/sound-pilot/runs/allophant-final \
  --output ../../.cache/sound-pilot/audits/new-audit
```

## 导出修复

原页面把“保存文件”和“达到目标事件校验要求”混为一体，缺理由或词位时提前返回，错误只显示在页顶，造成用户在底部点击后看似无反应。现在导出始终保存完整草稿，包含待核对项；按钮下方直接显示下载提示和可展开的待核对列表。正式事件校验仍独立执行，保存成功不表示标注合格或金标准备完成。词位输入的最小值也修正为 1。

原先打开的用户标签页不会被自动刷新或替换数据；新页面在独立浏览器中验收。导出的 QA 文件与人工初标分开存放。

## 本次验证

- 新增 15 个审计回归测试，与原 12 个 pilot 测试合计 27 个通过；覆盖源数据不变、显式修正条件、身份错配、整句初筛不转事件阴性、原始数组重建、缺符号/NaN/非法概率及不生成事件置信度。
- 根 `pnpm lint`、`pnpm build`、`pnpm test` 通过：API 2,023 项通过，未改动的 Web / Extension 测试使用 Turbo 成功缓存。日志为 `.cache/sound-pilot/first-pass-{lint,build,test}.log`。随后增加审计来源元数据和自动输出复核清单，重新执行实际审计及 27 项专项测试。
- Chromium 1400×1000 / 390×844：无横向溢出，导出提示在按钮旁可见；纯空白草稿、恢复原始 50 行后的草稿、键盘 Enter 下载及导入后再导出均成功。导出的 50 行逐字段与原始填写一致，包括原始无效词位、空理由和待标注项。仅修改 QA 标注者代号以防混入真实初标。
- 截图：`output/playwright/sound-pilot-export-{desktop,mobile}.png`。手机为视口模拟，不是物理设备验收；没有声称屏幕阅读器实机验收。
- 已更新本地服务页面和离线包 `.cache/sound-pilot/first-review-pack-draft-export.zip`，保留原页面备份。用户已经打开的页面保持原样，之后刷新才会加载新导出逻辑。
- Modern Web Guidance：使用 forms 的原生数值约束及“DO use non-color visual cues”要求；使用 accessibility 的“Announce dynamic errors via live regions”要求，在保存动作之后提供可见文本与 `role=status` 提示。未将正式复核要求用作草稿保存门槛。
