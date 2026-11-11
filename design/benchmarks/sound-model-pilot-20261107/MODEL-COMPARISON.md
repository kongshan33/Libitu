# 四模型真实录音对照 — 2026-11-08

本机页面：http://127.0.0.1:8768/ 。独立离线浏览页，不改在线 Stage 2。

第二轮 12 条完整真人原音分别实跑 ZIPA CR-small FP32、Allophant、Wav2Vec2Phoneme、Allosaurus，共 48 条结果。Azure 经用户选择保留未配置。没有模型训练，也没有准确率排名。

- ZIPA/Allophant 沿用锁定 checkpoint 和原推理器；Allophant 仍是已声明的 Intel Mac Torch 2.2.2 研究环境。
- Wav2Vec2 使用 facebook/wav2vec2-lv-60-espeak-cv-ft，revision ae45363bf3413b374fecd9dc8bc1df0e24c3b7f4。旧 weight_g/weight_v 键按 PyTorch 权重归一化的等价参数名转换，严格 load_state_dict(strict=True) 后重跑。初次自动加载发生随机初始化警告的结果保留在 wav2vec2/ 排查目录，绝不进入页面；页面仅使用 wav2vec2-strict/。
- Allosaurus 1.0.2、uni2005 通用权重、eng inventory、topk=1、emit=1.0；下载归档安全解压，所有模型文件逐个保存 SHA-256。隔离环境新增 resampy 0.4.3、numba 0.60.0、llvmlite 0.43.0、scipy 1.13.1；没有改变 API 环境。
- 四者只输入完整音频，不输入文本/人工标签。页面的目标裁剪只用于回听。原始音素、Allophant 全部属性头和模型版本可展开；符号高亮不是目标事件检测，CTC 帧不是边界，单人标签不是金标。

代码入口：apps/api/scripts/sound_pilot/compare_extra.py、build_comparison.py、comparison.html。原始运行位于 .cache/sound-pilot/comparison-20261108/；结果页位于其 site/。构建器检查模型完成状态、manifest、音频和文本身份，保存音频署名与许可证。

复现页面构建（仓库根目录）：

```sh
.cache/sound-pilot/venv/bin/python -m apps.api.scripts.sound_pilot.build_comparison
python3 -m http.server 8768 --bind 127.0.0.1 --directory .cache/sound-pilot/comparison-20261108/site
```

验收：48 条结果及 24 个原音/回听片段身份核验；拒绝未完成、音频错配、文本错配的 3 个故障注入；Chromium 桌面 1400×1000 / 手机视口 390×844 无横向溢出，12 项切换、24 次真实音频播放、0.75×、循环、原始字段展开和 JSON 下载通过。手机为视口模拟。未改应用共享结构，不把本次局部验证写成全项目测试或线上检测验收。

Modern Web Guidance 的 card 指南要求 “use <article> as the card root” 与独立原生操作，页面采用 article、原生按钮/播放器/details，避免卡片点击与播放/展开冲突。
