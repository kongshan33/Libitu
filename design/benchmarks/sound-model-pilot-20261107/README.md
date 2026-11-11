# GA Sound 模型试验 A＋B

范围：ZIPA 主候选、Allophant 对照；仅融合同化、鼻音部位同化、词内 T/D 闪音。离线开发，不改线上 Sound、录音、评分或 API。Vowel length 仍是清浊条件式提示。

最新进展：用户首轮初筛已恢复，并按明确回复区分整句未听到与具体词位观察。两模型原始数组已完成可重现对照；当前直接 `[ɾ]` 符号触发路径没有获得支持。详见[首轮发现与下一步](FIRST-PASS.md)，不要把下面“给第一位标注者”的原始说明误读为用户尚未开始。

用户随后要求再听一轮，已准备独立的[第二轮目标包](ROUND-TWO.md)：3 处复核＋9 条补充录音，三类各 4 项。2026-11-08 已收到并校验全部 12 项，8 有／4 无，没有裁剪问题；见[第二轮结果](ROUND-TWO-RESULTS.md)。仍无独立金标或该轮模型准确率。用户另提供并允许训练 Glossika 材料，见[资料清点与微调方案](../sound-glossika-20261108/PLAN.md)。

## 当前交付与边界

- A：16 条原始公开 WAV 的音素识别试跑，记录模型/音频/文本哈希、运行环境、逐句耗时、原始 CTC 分布。模型输入只有音频，没有把字幕或目标音素喂作提示。
- B：16 段随机编号的盲审包，三类共 48 个初筛格；规则仅找到 1 个融合同化、2 个词内闪音候选、0 个鼻音同化候选。候选是检查位置，不是阳性；初筛格也不是 48 个可评价事件。
- 用户选择先做一轮人工听辨。页面导出 `single_review`，未审项保持 null；当前没有已仲裁金标、事件准确率或上线资格。
- 16 条全部 dev、参考与学习者不是同句配对；同源说话人的录音不能拆成独立 test。禁止从此小样本发布泛化准确率。
- 本轮输出是音素/属性识别，不是三个事件检测器。事件定位、预测转事件、独立复核和逐类评测仍需后续工作；不能把句中任意一个 ɾ 当作目标处闪音。

## 给第一位标注者

打开项目本地 `.cache/sound-pilot/review-final/review.html`（可以直接双击，也可用下面的本地服务器）。文件包含原始音频，不依赖模型、账号或联网。

1. 填写代号，例如 `reviewer-A`；先原速听整句。
2. 展开文本，核对实际说出的内容，再看仅用于定位的文本候选。
3. 对每类选发生、未发生、无法判断或不适用，并写听辨理由。词编号从 1 开始，导出转换为 0-based 半开区间。
4. 发生/未发生必须指向实际词位。时间可留空；填写时是原始音频内秒数，不按慢速播放时间计算。
5. 需要时补充另一个目标，不只检查规则命中的位置。改写转录后复核所有词位。
6. 点击导出 JSON 保存；可导入同包 JSON 继续。导出始终允许保留草稿，空白理由或无效词位只会在按钮旁列为待复核项，不阻止保存。浏览器暂存只是辅助，不能代替导出。未完成项不会变成负类；成功保存也不代表通过目标事件校验。

两套模型输出和样本身份映射不显示在标注页。第一轮提交前不要查看 `runs` 内预测。QA 自动填写的文件只在 `output/playwright/`，不是人工标签。

```sh
python3 -m http.server 8766 --bind 127.0.0.1 --directory .cache/sound-pilot/review-final
```

第二位独立初标和分歧仲裁仍遵循 [原标注规范](../../../apps/api/benchmarks/acoustics/v1/ANNOTATION.md)。当前单人包是开发初筛，不能直接覆盖原 manifest 或自动转换成 adjudicated。新增 GA 类别先保存在此独立协议，避免混用旧基准的 `assimilation` 与 `flap_t` 含义。

## 模型及实现

两套模型均已完成 16/16 原音频推理，原始数组通过维度/有限数值检查，模型文件与上游锁定对象的 SHA-256 一致。[无预测汇总](SUMMARY.json)记录精确数值和结果文件哈希。

| 本机观察 | ZIPA FP32 | Allophant（补齐 inventory 最终轮） |
|---|---:|---:|
| 完成片段 | 16 | 16 |
| 单句推理中位数 | 0.162 秒 | 1.799 秒 |
| 单句推理范围 | 0.088–0.223 秒 | 0.948–16.680 秒 |
| 进程峰值 RSS | 734 MiB | 2589 MiB |
| 加载阶段（含适配器依赖导入） | 15.0 秒 | 599.6 秒 |

这不是受控性能对比。最终 Allophant 轮遇到明显本机负载/启动延迟，其他测试和浏览器也同时变慢；此前调试轮加载约 20.4 秒，但 inventory 不同，不能挑选该轮作正式速度成绩。不要外推服务器、手机、并发或线上端到端延迟。这里没有报告识别准确率。

| 对象 | 固定版本／来源 |
|---|---|
| ZIPA | `anyspeech/zipa-small-crctc-500k`，revision `dfe87c97662606fa6db90ad06f627d4363314744`；FP32，CPU 两线程 |
| Allophant | `kgnlp/allophant`，revision `ad69d315e4c42991cb3faecd294476515195237d`；CPU 两线程 |
| Base config | `facebook/wav2vec2-xls-r-300m` revision `1a640f32ac3e39899438a2931f9924c02f080a54`，只取配置、不下载另一份权重 |
| Runtime | 隔离 `.cache/sound-pilot/venv`，完整包版本见 `environment-macos.txt` |

ZIPA 的特征提取遵循官方 ONNX 示例：Lhotse Fbank80，dither=0，snip_edges=false。固定原始 mono/16kHz WAV，不重采样现有种子。CTC emission frame 不是音素起止时间；blank 不是省音；原始 log probabilities 不是已校准的事件置信度。

Allophant 的默认英语集合缺少本轮需要的普通 p/t/k；最终使用原英语集合并显式加入 p/t/k/ɾ/ʔ/m/ŋ/n，保存完整集合。它用 d̠ʒ/t̠ʃ 等符号，不能与 ZIPA 的字符序列不经规范化直接算差异。此前未补 p/t/k 的 `allophant-03` 只保留为调试记录，不用于效果比较。

Intel macOS 上的 PyTorch wheel 限制使本轮采用 torch/torchaudio 2.2.2，覆盖 Allophant 声明的 >=2.3.1；这是明确记录的实验兼容配置，不是官方支持的部署环境。生产候选应在受支持 Linux 环境复现。还固定 setuptools 以提供旧依赖需要的 pkg_resources、numcodecs<0.16 兼容 Zarr 2。

## 复现

在仓库根目录运行。模型共约 1.55 GB，环境另占空间；不修改 API venv。不需要 API key，不上传音频。

```sh
uv venv --python 3.11 .cache/sound-pilot/venv
uv pip install --python .cache/sound-pilot/venv/bin/python --overrides apps/api/scripts/sound_pilot/mac-overrides.txt -r apps/api/scripts/sound_pilot/requirements.txt
.cache/sound-pilot/venv/bin/python apps/api/scripts/sound_pilot/download.py --root .cache/sound-pilot

# 两个模型分别执行；每次用新 output，不覆盖原记录。
HF_HUB_CACHE="$PWD/.cache/sound-pilot/hf" .cache/sound-pilot/venv/bin/python apps/api/scripts/sound_pilot/run.py --model zipa --models .cache/sound-pilot/models --manifest apps/api/benchmarks/acoustics/v1/public_seed/manifest.json --audio-root .cache/acoustic-benchmark/public-seed --output .cache/sound-pilot/runs/zipa-new
HF_HUB_CACHE="$PWD/.cache/sound-pilot/hf" .cache/sound-pilot/venv/bin/python apps/api/scripts/sound_pilot/run.py --model allophant --models .cache/sound-pilot/models --manifest apps/api/benchmarks/acoustics/v1/public_seed/manifest.json --audio-root .cache/acoustic-benchmark/public-seed --output .cache/sound-pilot/runs/allophant-new
```

Linux 不使用 mac-overrides；需另冻结、测试受支持环境，不能沿用本机结果声称跨平台验证。推理强制 offline，下载器仅下载锁定文件并验证 SHA-256。首次缺少音频时按[原种子说明](../../../apps/api/benchmarks/acoustics/v1/README.md)恢复。

生成初标页面、核验用户导出（在 `apps/api` 下）：

```sh
.venv/bin/python -m scripts.sound_pilot.prepare --manifest benchmarks/acoustics/v1/public_seed/manifest.json --audio-root ../../.cache/acoustic-benchmark/public-seed --output ../../.cache/sound-pilot/review-new
.venv/bin/python -m scripts.sound_pilot.review_check ../../.cache/sound-pilot/review-final/pack.json /absolute/path/to/export.json
.venv/bin/pytest tests/test_sound_pilot.py
```

原始音频、嵌入音频页面、模型、原始数组和人工输出均留在忽略的 `.cache`；仓库保留代码、锁、协议和无预测的汇总。不要把公开基准的 benchmark_only 标记变成训练授权。

## 下一批需补采的语境（计划，尚无录音或标签）

| 类别 | 可自然出现目标的句子 | 对照／混淆检查 |
|---|---|---|
| 融合同化 | Did you see it? / Would you help? / Don't you know? | Did he see it?；词典自带塞擦音如 choose 不算融合；目标处保留分开读也是有效反例 |
| 鼻音部位同化 | Ten boys came. / One more time. / Ten cars passed. / In good time. | Ten days passed. 是语境对照，不是同一适用目标的 absent；目标语境里也需实际保留 [n] 的录音 |
| 词内闪音 | A better letter. / Put the ladder here. / The city is busy. | attack/retail 不符合本轮重音条件；在适用词内需保留塞音、声门等真实替代实现作混淆例 |

建议多位 GA 成人与中国英语学习者自然朗读，保留不同语速、设备与自然替代实现。不要强迫照预期音变读，也不要给计划句预填 present/absent。先小规模试标，再按实际目标数、标注一致性和类别缺口扩充；规模不能按句数替代事件数。

## 验证记录

- `pnpm lint`、`pnpm build` 通过。
- 最终 `pnpm test` 通过：API 2,008 / Web 540 / Extension 124。首次全量在明显系统负载期间有 3 个现有声学子进程计时测试失败（pause/resume、kill/reap、lease heartbeat）；模型结束后相关文件与新增测试 41/41 通过，随后完整根测试通过。保留首次失败日志，不以重试掩盖它。
- 新增 12 个测试验证 CTC blank/重复符号处理、音频/包身份、词位/时间/NaN 校验、pending/uncertain 不当负例及 single_review 不提升为金标。
- 下载锁的 5 个文件全部 SHA-256 核验成功；两模型 32 条输出的数组维度和有限数值检查通过。最终 Allophant inventory 包含普通 p/t/k 和 ɾ/ʔ。
- Playwright 实际 Chromium：1400×1000 与 390×844 下无横向溢出；嵌入 WAV readyState=4，切换保留标签、原速/0.75×、JSON 下载、同包导入均通过。截图位于 `output/playwright/sound-pilot-{desktop,mobile}.png`。手机为浏览器尺寸模拟，不是物理手机测试。
- 导出的 QA fixture 通过 Python 导入校验，明确为 `QA-only`、`eligible_gold=0`，仅存 `output/playwright/`，没有写入人工数据集。
- 最终页面 HTTP 200，生成的离线 ZIP 包仅含页面与完整来源许可，不包含模型预测或身份映射。前端未使用任何外部请求或分析埋点。
- 核心日志：`.cache/sound-pilot/{root-lint,root-build,root-test,root-test-final,retest,allophant-final}.log`；只读单人初标入口 `http://127.0.0.1:8766/review.html`，服务只监听 loopback。

## 来源与许可

- [ZIPA 官方实现与许可](https://github.com/lingjzhu/zipa)；选用非 NS 的 CC BY 4.0 权重。研究结论不能外推为 GA 事件准确率。
- [ZIPA 论文](https://aclanthology.org/2025.acl-long.961/)指出音素模型可能平滑实际发音差异。
- [Allophant 模型卡](https://huggingface.co/kgnlp/allophant)：Apache-2.0，自定义 inventory 和属性输出。
- 本地公开语音来源与完整许可保留在 `apps/api/benchmarks/acoustics/v1/public_seed/`，随初标包复制。
