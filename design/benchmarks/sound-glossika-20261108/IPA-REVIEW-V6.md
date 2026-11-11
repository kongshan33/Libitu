# 新听辨标注接收与开发集重评 v6

五条均来自本机保存 revision 29，已确认，无未处理的不确定标记。原始字节保存在 RAW-REVIEW.json；不改写页面保存记录。

## 用户确认后的调整

- take a 的结合弧改为单独词界连读元数据，IPA 为 teɪk ə。
- drank 的 r 为 ɹ 的简写，局部改为 dɹæŋk。
- 两条 vacation 末尾 n 确认成音节，局部改为 ṇ。

保留 eɪ、aɪ、ɔɹ、ɚ 等实际填写，不机械改成教材风格。词汇重音 ˈ 在 v4 词表外，但评测无需把参考编码为训练标签。选择指标仅从双方兼容形式中去除词汇重音，原记法/兼容/基础单位指标同时保留。不改词表、不改模型、不将五条开发录音加入训练。

五条录音来自两个 CMU Arctic 源说话者（slt/bdl），只有三种句子。重复句子录音哈希不同；不能当五种独立句型。单人听辨及残余记法差异仍限制准确率解释。

## 已有模型：新开发标注下的分数

|模型|去词汇重音兼容 CER|基础单位错误率|原记法 CER|
|---|---:|---:|---:|
|原模型|24.20%|20.27%|26.95%|
|上一轮 50 条|21.66%|19.59%|26.35%|
|上一轮 549 条|55.63%|29.73%|58.28%|
|v4 新头 549 条|51.59%|27.03%|53.49%|

微调行取三个种子均值；这是新五条开发集，不能直接与旧八条回归百分比混算。

## 用新开发标注选择已有 v5 checkpoint

|种子|选择轮次|开发去重音兼容 CER|外部基础错误率（选择轮）|外部基础错误率（40 轮）|
|---|---:|---:|---:|---:|
|20261109|8|35.67%|40.00%|31.80%|
|20261110|14|36.31%|32.13%|31.80%|
|20261111|9|35.03%|38.03%|31.80%|

这些模型在新标签出现前已训练完成。本轮优化器更新为 0，只重评 120 个已有 checkpoint；先写入选择冻结文件，再读取旧外部回归分数。新的开发选择已属于调参，不是独立盲测。

## 五条逐句对照

### listen-03 · cmu-arctic-slt
Philip ate lightly of the food which Pierre had ready for him.
[录音](/Users/river/Documents/Libitu/.cache/sound-pilot/ipa-diagnostic-v5-20261109/listening-review/audio/listen-03.wav)

原始填写：`ˈfɪləp eɪʔ ˈlaɪɾli əv ðə fuːd wɪtʃ piˈɛɹ hæd ˈɹɛɾi fɔɹ ɪm`

确认后参考：`ˈfɪləp eɪʔ ˈlaɪɾli əv ðə fuːd wɪtʃ piˈɛɹ hæd ˈɹɛɾi fɔɹ ɪm`

original：`fɪlɪpeɪtlaɪtliʌvðəfuːdwɪtʃpiɛhædɹɛdifɔːɹhɪm`

previous_full_20261109：`fɪ̩lɪpeːʔlaʔliːʌvd̪əfuːdwɪʧpiːɛːʴɦædɹɛːdiːfɑːʴɦɛːm`

fresh_v4_full_20261109：`fɪːlɪpeːʔːlːaːʔːlːiːʌv̪əfudwɪʧpiːɛːʴɦædɹɛdifɑːʴɦɪm`

v5 验证选择（seed 20261109，epoch 8）：`fɪlɪbeʔlaʔliʌv̪əfudwɪʧpiɛhædʴɛdifɑhɪ`

### listen-04 · cmu-arctic-slt
You can take a vacation on pay.
[录音](/Users/river/Documents/Libitu/.cache/sound-pilot/ipa-diagnostic-v5-20261109/listening-review/audio/listen-04.wav)

原始填写：`ju kæn teɪk͡ə vəˈkeɪʃn ɑːm peɪ`

确认后参考：`ju kæn teɪk ə vəˈkeɪʃṇ ɑːm peɪ`

original：`juːkænteɪkɐveɪkeɪʃənɔnpeɪ`

previous_full_20261109：`juuːkʰɪnteːk⁼əveːkʰeːʃənɑːnpeːʲ`

fresh_v4_full_20261109：`jukænteːk⁼əveːkeːʃənɑnpeːʲ`

v5 验证选择（seed 20261109，epoch 8）：`jukæntekəvekeʃənɑnpe`

### listen-11 · cmu-arctic-bdl
Philip ate lightly of the food which Pierre had ready for him.
[录音](/Users/river/Documents/Libitu/.cache/sound-pilot/ipa-diagnostic-v5-20261109/listening-review/audio/listen-11.wav)

原始填写：`ˈfɪləp eɪʔ ˈlaɪɾli əv ðə fuːd wɪtʃ piˈɛɹ hæd ˈɹɛɾi fɔɹ ɪm`

确认后参考：`ˈfɪləp eɪʔ ˈlaɪɾli əv ðə fuːd wɪtʃ piˈɛɹ hæd ˈɹɛɾi fɔɹ ɪm`

original：`fɪlɪpeɪtlaɪtliʌvðəfuːdwɪtʃpiːɜːhædɹɛdifɚhɪm`

previous_full_20261109：`fɪːɫlɪpeːʔlaʲʔliːʲʌvdəfuːdwɪʧpiːʲɛːʴhæːdɹɛːdiːfəʴɦɛːm`

fresh_v4_full_20261109：`fɪːɫlɪpeːʔlaːʔliːʲʌvdəfudwɪʧpiːɛːʴhædɹɛdiːfəːʴɦɛm`

v5 验证选择（seed 20261109，epoch 8）：`fɪɫɪbeʔlaʔliʌv̪əfudwɪʧpiɛhædʴɛdifəhɪm`

### listen-13 · cmu-arctic-bdl
You can take a vacation on pay.
[录音](/Users/river/Documents/Libitu/.cache/sound-pilot/ipa-diagnostic-v5-20261109/listening-review/audio/listen-13.wav)

原始填写：`ju kən teɪk͡ə vəˈkeɪʃn ɑːm peɪ`

确认后参考：`ju kən teɪk ə vəˈkeɪʃṇ ɑːm peɪ`

original：`juːkənteɪkɐveɪkeɪʃənɔnpeɪ`

previous_full_20261109：`juuːʷkɪnteːʲkəv̪eːʲkʰeːʲʃənɑnpeːʲ`

fresh_v4_full_20261109：`juʷkæn͡teːʲk⁼əv̪eːʲkeːːʃənɑnpeːʲ`

v5 验证选择（seed 20261109，epoch 8）：`jukæntekəvekeʃənɑnpe`

### listen-14 · cmu-arctic-slt
He drank of the water cautiously.
[录音](/Users/river/Documents/Libitu/.cache/sound-pilot/ipa-diagnostic-v5-20261109/listening-review/audio/listen-14.wav)

原始填写：`hiː dræŋk əv ðə ˈwɑːɾɚ ˈkɔːʃəsli`

确认后参考：`hiː dɹæŋk əv ðə ˈwɑːɾɚ ˈkɔːʃəsli`

original：`hiːdɹæŋkʌvðəwɑːɾɚkɑːʃəsli`

previous_full_20261109：`hiːdɹæŋkʌv̪əwɑːɾəkʰɑːʃəsliː`

fresh_v4_full_20261109：`hiːdɹæŋkʌv̪əwɑɾəkɑʃəsliʲ`

v5 验证选择（seed 20261109，epoch 8）：`hidʴæŋkʌv̪əwɑɾəkɑʃəzli`


完整原始标签、确认记录、评分契约、逐轮分数：`/Users/river/Documents/Libitu/.cache/sound-pilot/ipa-review-v6-20261109`。

## 结论与下一步

新开发标注选择第 8/14/9 轮；旧教材同域验证选择第 40/40/38 轮。选择准则与标签集合均改变，因此不能把轮次变化只归因于“更准确的标注”。

在同一批八条已曝光回归录音上，新开发选择相较固定 40 轮：原记法 CER 51.80% → 48.01%，兼容 CER 50.09% → 47.73%，基础单位错误率 31.80% → 36.72%。字符指标改善伴随基础音指标恶化，不支持直接替换原模型，也未证明简单早停可以解决迁移问题。

新增听辨参考没有让 549 条版本恢复到原模型水平。对同一批五条录音、相同已保存输出和相同去重音兼容评分，替换旧参考后：

|版本|旧五条参考 CER|新五条参考 CER|
|---|---:|---:|
|原模型|20.62%|24.20%|
|上一轮 50 条|18.12%|21.66%|
|上一轮 549 条|54.58%|55.63%|
|v4 新头 549 条|50.00%|51.59%|

变化只反映参考更新后的评分，不是模型训练效果。五条记录为三句、两名说话者，不能将微小差距视为稳定泛化收益。
后续对照优先固定数据、初始化与输出词表，再比较“原 Glossika 目标”和“人工听辨修订的同一批录音目标”；修订必须基于录音，不能用模型输出代替。当前五条继续保留作开发参考，不能回流训练。新增封存测试仍未准备。
本轮已完成本机结果提取、原文冻结、用户确认修订、音频哈希检查、全体已有模型重评分、120 个 checkpoint 开发集评测与选择核验。没有声学现象分类头训练，没有优化器更新。
