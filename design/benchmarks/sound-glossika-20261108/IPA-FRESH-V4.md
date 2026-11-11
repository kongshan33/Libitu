# v4 自建 IPA 输出头对比

549 条教材监督；冻结底座；全新随机 117 项输出头。3 个固定种子，各 40 epochs，AdamW 1e-4，batch 7。
同一批 8 条已曝光的独立录音，属于回归对比，不是新盲测。未按此结果选择训练轮次。

| 版本 | 基础单位错误率 | 兼容 CER | 原记法 CER |
|---|---:|---:|---:|
| original | 19.02% | 26.99% | 26.99% |
| previous_reviewed | 19.67% | 27.46% | 27.46% |
| previous_full | 31.48% | 48.86% | 49.91% |
| fresh_v4 | 32.68% | 50.47% | 51.80% |

逐句展示预先固定种子 20261109；JSON 保存全部种子。宽式外部参考不能验证窄式附标的声学正确性。

## listen-01
Her own betrayal of herself was like tonic to Philip.

[录音](/Users/river/Documents/Libitu/.cache/sound-pilot/ipa-probe-v3-20261109/audio/listen-01.wav)

参考：`hɚ oʊn̪͡m bɪˈtɹeɪəl əv hɚˈsɛlf wəz laɪk ˈtɑːnɪk tə ˈfɪləp`

原模型：`hɜːɹoʊnbɪtɹeɪəllʌvhɚsɛlfwʌzlaɪktɑːnɪktəfɪlɪp`

上一轮 549 条：`həʴõnbɪʦɹeːɫɫʌvɦəsɛːɫl̩fwʌzlaʲktɑːnɪktəfɪlɪp`

本轮：`həʴõnbiʦʴɹeːɫːɫʌvɦəsɛːɫfwʌzlːaːktɑnɪktəfɪːlɪp`

## listen-02
Every bone in her aged body seemed broken or dislocated.

[录音](/Users/river/Documents/Libitu/.cache/sound-pilot/ipa-probe-v3-20261109/audio/listen-02.wav)

参考：`ˈevri boʊn ɪn hɚ ˈeɪdʒd ˈbɑːɾi siːmd ˈbroʊkən ɔɹ ˌdɪsˈloʊkeɪɾɪd`

原模型：`ɛvɹiboʊnɪnhɜːɹeɪdʒᵻdbɑːdisiːmdbɹoʊkənɔːɹdɪsloʊkeɪɾᵻd`

上一轮 549 条：`ɛːvɹiːboːnɪnhəʴeːʤədbɑːdiːsiːmdbɹoːʷkənɑːdɪsːloːkʰeːɾəd`

本轮：`ɛvɹiːbõnɪnhəʴeːʤədbɑdisimdbʴɹõʷkənɑdɪsːlõːkeːɾəd`

## listen-05
I was about to do this when cooler judgment prevailed.

[录音](/Users/river/Documents/Libitu/.cache/sound-pilot/ipa-probe-v3-20261109/audio/listen-05.wav)

参考：`aɪ wəz əˈbaʊʔ tə duː ðɪs weŋ ˈkuːlər ˈdʒʌdʒmənt prɪˈveɪld`

原模型：`aɪwʌzɐbaʊttəduːðɪswɛnkuːlɚdʒʌdʒməntpɹᵻveɪld`

上一轮 549 条：`aːwʌzəbaʷʔtəduːdɪswɛːnkʰuːləʤʌʤmən͡ʔpʴɹəveːɫ̩ː͡d`

本轮：`aːwʌzəbaːʷʔttədudɪswɛnkuːləʤʌʤmn͡ʔpʴəveːːɫː͡d`

## listen-06
Everything was working smoothly, better than I had expected.

[录音](/Users/river/Documents/Libitu/.cache/sound-pilot/ipa-probe-v3-20261109/audio/listen-06.wav)

参考：`ˈevriθɪŋ wəz ˈwɜːrkɪŋ ˈsmuːðli ˈbeɾɚ ðæn aɪ hæd ɪkˈspektɪd`

原模型：`ɛvɹiθɪŋwʌzwɜːkɪŋsmuːðlibɛɾɚðɛnaɪhædɛkspɛktᵻd`

上一轮 549 条：`ɛːvɹiːt̪ɪŋgwʌzwʴkʰɪːŋsmuːdliːbɛːɾəd̪ɛːnaːʲhæːdɛːksp̪ɛːktɪd`

本轮：`ɛvɹiː̪ɪŋʲwʌzwʴːkɪŋsmuːdːlːibɛɾəd̪ɛnaːʲhædɛksp̪ɛkɾɪd`

## listen-07
I was about to do this when cooler judgment prevailed.

[录音](/Users/river/Documents/Libitu/.cache/sound-pilot/ipa-probe-v3-20261109/audio/listen-07.wav)

参考：`aɪ wəz əˈbaʊʔ tə duː ðɪs weŋ ˈkuːlər ˈdʒʌdʒmənt prɪˈveɪld`

原模型：`aɪwʌzɐbaʊttəduːðɪswɛnkuːlɚdʒʌdʒməntpɹᵻveɪld`

上一轮 549 条：`aːwʌzəbaʷʔtəduːdɪswʌnkʰuːləʤʌʤməntpɹəveːɫ̩d`

本轮：`aːwʌzəbaːʷʔttəduːdɪswɛnkuːləʤʌʤmntpʴəveːːɫːd`

## listen-08
And now, down there, Eileen was waiting for him.

[录音](/Users/river/Documents/Libitu/.cache/sound-pilot/ipa-probe-v3-20261109/audio/listen-08.wav)

参考：`ən naʊ daʊn ðer aɪˈliːn wəz ˈweɪɾɪŋ fɔːr ɪm`

原模型：`ændnaʊdaʊnðɛɹaɪliːnwʌzweɪɾɪŋfɚhɪm`

上一轮 549 条：`ændnɑːdandɛːʴaːliːnwʌzweːɾɪŋfəhɪːm`

本轮：`ændnaːʷdaʷndɛʴaːliːnwʌzweːɾɪŋfəɦɪm`

## listen-09
The Fire People, like ourselves, lived in caves.

[录音](/Users/river/Documents/Libitu/.cache/sound-pilot/ipa-probe-v3-20261109/audio/listen-09.wav)

参考：`ə ˈfaɪɚ ˈpiːpl laɪk ɑːrˈsɛlvz lɪvd ɪŋ keɪvz`

原模型：`ðəfaɪɚpiːpəllaɪkaʊsɛlvzlɪvdɪnkeɪvz`

上一轮 549 条：`d̪əfaːʴpiːpɫlaʲkɑːʴsɛːɫlvzlɪvdɪnkʰeːvz`

本轮：`̪əfaːʴpipɫːːlakaʴsɛːɫvzlɪvdɪnkeːvz`

## listen-10
I was the only one who remained sitting.

[录音](/Users/river/Documents/Libitu/.cache/sound-pilot/ipa-probe-v3-20261109/audio/listen-10.wav)

参考：`aɪ wəz ði ˈoʊnli wʌn huː rɪˈmeɪnd ˈsɪɾɪŋ`

原模型：`aɪwʌzðɪoʊnliwʌnhuːɹᵻmeɪndsɪɾɪŋ`

上一轮 549 条：`aːwʌz̪ɪõn͡liːʲwʌnhuːʷɹəmeːn͡dsɪɾɪŋ`

本轮：`awʌz̪ɪõn͡liːwʌnhuːʷɹəmeːn͡dsɪɾɪŋ`


## 验证与范围

原模型 562 条基线输出与上一轮逐条一致；13 条外部开发／回归录音清单完全一致。三个头均通过保存重载预测一致性验证，checkpoint SHA-256 已核验。原完整模型哈希保持不变。11 项回归测试通过；API 环境无 torch 的初始化测试跳过，随后在实际训练环境手工执行同一初始化断言通过。

本轮只有线性 CTC 头更新，声学底座冻结。未训练语音现象头，未替换线上模型。新增符号可编码不代表训练数据中存在该符号的正例。宽式外部标注不足以验证窄式附标，结果只适用于当前评分契约。

全部种子、逐句输出、配置与三个模型头：`.cache/sound-pilot/wav2vec2-ipa-fresh-v4-20261109/`。执行入口：`apps/api/scripts/sound_pilot/ipa_fresh_v4.py`。训练配置在运行前冻结，未根据这八条录音调参。
