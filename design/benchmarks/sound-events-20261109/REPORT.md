# 闪音数据及四底座对照结果 v1

使用专业源音值标注，无新增用户听辨。数据通过研究副本获取；官方／上游样例核对只证明抽查范围，不能认证整份副本完全等同原发行包。

## 数据核验

- 解码检查 6554 条源记录；保留 6517 个唯一录音身份。
- Buckeye 副本有 37 条重复；标签与音频均核对一致后去重。副本只覆盖 34 名说话者，不称作完整 40 人语料。
- 音频／标签范围不符的 1 条记录已整条隔离，不进入训练、验证、测试。
- Buckeye 原始格式样例 21 个音值区间符合 round(seconds × 16)；保留 62.5ms 量化误差，不用来测量闪音时长。
- TIMIT 官方示例音值序列唯一匹配；官方示例 PCM 匹配：True。
- 未见说话者不代表未见句式；上游预训练覆盖未知。TIMIT SA 句排除，其他共享句式保留并披露。

## 专业音值支持的保守派生数量

下表不是新做的独立现象金标，也不是全部现象发生数。完整词位映射失败的项不作为负例。

| 语料 | 现象 | 正例 | 负例 | 未确定 |
|---|---|---:|---:|---:|
| buckeye | flap | 4318 | 23711 | 22844 |
| buckeye | assimilation | 181 | 780 | 36486 |
| buckeye | coalescence | 25 | 57 | 1209 |
| timit | flap | 1340 | 4648 | 5112 |
| timit | assimilation | 41 | 374 | 9543 |
| timit | coalescence | 0 | 9 | 125 |

融合在此划分的验证集缺少可靠正例，因此本轮只清点，不训练或报告该类准确率。同化亦未训练。

## 固定闪音子集

| 语料 | 划分 | 正例 | 负例 |
|---|---|---:|---:|
| buckeye | train | 346 | 454 |
| buckeye | dev | 145 | 155 |
| buckeye | test | 129 | 171 |
| timit | train | 465 | 335 |
| timit | dev | 193 | 107 |
| timit | test | 173 | 127 |

训练、验证、测试的说话者完全隔离；TIMIT 保留官方测试身份。源 PCM 跨划分重复检查通过。共同候选环境为词典元音／r 后、元音前；按说话者轮转抽样，不能把其类别比例当作自然总体发生率。

## 测试结果

所有值为三种子的平均值；F1 后为种子标准差，单位百分点。AP 为精确率—召回率曲线的汇总指标，越高越好。每种子的说话者 bootstrap 95% 区间与逐条概率保存在结果 JSON。

| 模型 | 输入 | 语料 | Precision | Recall | F1 ± SD | AP |
|---|---|---|---:|---:|---:|---:|
| wav2vec2-phoneme | audio | buckeye | 82.81 | 91.73 | 86.99 ± 0.90 | 91.54 |
| wav2vec2-phoneme | audio | timit | 88.84 | 97.88 | 93.13 ± 0.16 | 98.44 |
| wav2vec2-phoneme | audio_context | buckeye | 86.14 | 91.21 | 88.56 ± 1.21 | 93.11 |
| wav2vec2-phoneme | audio_context | timit | 91.97 | 96.92 | 94.37 ± 0.74 | 98.24 |
| wavlm-base-plus | audio | buckeye | 82.49 | 92.51 | 87.21 ± 0.32 | 91.34 |
| wavlm-base-plus | audio | timit | 88.51 | 99.23 | 93.56 ± 1.07 | 98.00 |
| wavlm-base-plus | audio_context | buckeye | 79.44 | 97.67 | 87.61 ± 0.55 | 92.20 |
| wavlm-base-plus | audio_context | timit | 86.36 | 100.00 | 92.68 ± 0.52 | 97.80 |
| wavlm-large | audio | buckeye | 83.53 | 94.32 | 88.59 ± 0.40 | 92.11 |
| wavlm-large | audio | timit | 90.66 | 99.04 | 94.66 ± 0.56 | 98.58 |
| wavlm-large | audio_context | buckeye | 83.19 | 96.64 | 89.38 ± 0.58 | 93.11 |
| wavlm-large | audio_context | timit | 90.44 | 99.61 | 94.79 ± 1.17 | 98.29 |
| hubert-large | audio | buckeye | 77.51 | 93.28 | 84.63 ± 0.54 | 90.84 |
| hubert-large | audio | timit | 89.02 | 97.50 | 93.03 ± 1.28 | 98.48 |
| hubert-large | audio_context | buckeye | 79.22 | 94.57 | 86.22 ± 0.30 | 92.02 |
| hubert-large | audio_context | timit | 88.88 | 97.50 | 92.95 ± 1.56 | 98.53 |
| context | context | buckeye | 66.24 | 90.18 | 76.37 ± 0.19 | 78.91 |
| context | context | timit | 68.43 | 82.08 | 74.60 ± 1.27 | 78.90 |

该成绩只适用于已定位候选窗口中的闪音／保留塞音二分类。模型没有自行找到词位，没有验证全部非闪音类型，也没有接入用户录音或产品；不报告 12 类综合准确率。原模型和 IPA 头未改动。

## 文件

- [固定实验与复现命令](README.md)
- [全量派生清单](../../../.cache/sound-pilot/events-v1-20261109/inventory.json)
- [说话者划分](../../../.cache/sound-pilot/events-v1-20261109/speaker-splits.json)
- [训练／验证／测试清单](../../../.cache/sound-pilot/events-v1-20261109/manifest.json)
- [源核验](../../../.cache/sound-pilot/events-v1-20261109/SOURCE-AUDIT.json)
- [逐种子指标与逐条输出](../../../.cache/sound-pilot/events-v1-20261109/RESULTS.json)
