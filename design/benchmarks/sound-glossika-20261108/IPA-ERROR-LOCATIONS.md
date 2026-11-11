# 已有 IPA 输出的逐处差异定位

固定展示种子 20261109；CSV/JSON 包含全部种子和上一轮 50 条版本。
偏移为兼容记法 NFD 字符位置（从 0 开始），不是音素序号或音频时间。∅ 表示插入／删除。
分类只描述一次最小编辑对齐：base_difference 为基础字符差异，mark_difference 为附标／韵律字符差异，mixed_alignment 为两类跨类对齐。它们不是已经听辨确认的错误原因；不同等价最优对齐可能改变分类。
采用既有显式别名后比较；不会合并 d̪/ð、r/ɹ、eʲ/eɪ 等真实或待判断的音质区别。

## listen-01
Her own betrayal of herself was like tonic to Philip.
[原录音](/Users/river/Documents/Libitu/.cache/sound-pilot/ipa-probe-v3-20261109/audio/listen-01.wav)

既有参考：`hɚ oʊn̪͡m bɪˈtɹeɪəl əv hɚˈsɛlf wəz laɪk ˈtɑːnɪk tə ˈfɪləp`

### 原模型
输出：`hɜːɹoʊnbɪtɹeɪəllʌvhɚsɛlfwʌzlaɪktɑːnɪktəfɪlɪp`

|参考偏移|输出偏移|参考→输出|参考上下文|输出上下文|差异类型|
|---:|---:|---|---|---|---|
|1|1|∅ → ɜ|hɚoʊn̪|hɜːɹoʊ|base_difference|
|1|2|∅ → ː|hɚoʊn̪|hɜːɹoʊn|mark_difference|
|1|3|ɚ → ɹ|hɚoʊn̪|hɜːɹoʊnb|base_difference|
|5|7|̪ → ∅|ɚoʊn̪͡mbɪ|ɹoʊnbɪtɹe|mark_difference|
|6|7|͡ → ∅|oʊn̪͡mbɪˈ|ɹoʊnbɪtɹe|mark_difference|
|7|7|m → ∅|ʊn̪͡mbɪˈt|ɹoʊnbɪtɹe|base_difference|
|10|9|ˈ → ∅|͡mbɪˈtɹeɪ|ʊnbɪtɹeɪə|mark_difference|
|16|14|∅ → l|ɹeɪələvhɚ|ɹeɪəllʌvh|base_difference|
|17|16|ə → ʌ|eɪələvhɚˈ|ɪəllʌvhɚs|base_difference|
|21|20|ˈ → ∅|əvhɚˈsɛlf|ʌvhɚsɛlfw|mark_difference|
|27|25|ə → ʌ|ɛlfwəzlaɪ|ɛlfwʌzlaɪ|base_difference|
|33|31|ˈ → ∅|laɪkˈtɑːn|laɪktɑːnɪ|mark_difference|
|42|39|ˈ → ∅|ɪktəˈfɪlə|ɪktəfɪlɪp|mark_difference|
|46|42|ə → ɪ|ˈfɪləp|əfɪlɪp|base_difference|

以上差异均待听辨确认；无可信音素时间边界，因此不自动裁切“音素片段”。

### 上一轮 549 条
输出：`həʴõnbɪʦɹeːɫɫʌvɦəsɛːɫl̩fwʌzlaʲktɑːnɪktəfɪlɪp`

|参考偏移|输出偏移|参考→输出|参考上下文|输出上下文|差异类型|
|---:|---:|---|---|---|---|
|1|1|∅ → ə|hɚoʊn̪|həʴõn|base_difference|
|1|2|ɚ → ʴ|hɚoʊn̪|həʴõnb|mixed_alignment|
|3|4|ʊ → ̃|hɚoʊn̪͡m|həʴõnbɪt|mixed_alignment|
|5|6|̪ → ∅|ɚoʊn̪͡mbɪ|ʴõnbɪt͡s|mark_difference|
|6|6|͡ → ∅|oʊn̪͡mbɪˈ|ʴõnbɪt͡s|mark_difference|
|7|6|m → ∅|ʊn̪͡mbɪˈt|ʴõnbɪt͡s|base_difference|
|10|8|∅ → t|͡mbɪˈtɹeɪ|̃nbɪt͡sɹe|base_difference|
|10|9|ˈ → ͡|͡mbɪˈtɹeɪ|nbɪt͡sɹeː|mark_difference|
|11|10|t → s|mbɪˈtɹeɪə|bɪt͡sɹeːɫ|base_difference|
|14|13|ɪ → ː|ˈtɹeɪələv|͡sɹeːɫɫʌv|mixed_alignment|
|15|14|ə → ɫ|tɹeɪələvh|sɹeːɫɫʌvɦ|base_difference|
|16|15|l → ɫ|ɹeɪələvhɚ|ɹeːɫɫʌvɦə|base_difference|
|17|16|ə → ʌ|eɪələvhɚˈ|eːɫɫʌvɦəs|base_difference|
|19|18|h → ∅|ələvhɚˈsɛ|ɫɫʌvɦəsɛː|base_difference|
|20|18|ɚ → ɦ|ləvhɚˈsɛl|ɫɫʌvɦəsɛː|base_difference|
|21|19|ˈ → ə|əvhɚˈsɛlf|ɫʌvɦəsɛːɫ|mixed_alignment|
|24|22|∅ → ː|ɚˈsɛlfwəz|ɦəsɛːɫl̩f|mark_difference|
|24|23|∅ → ɫ|ɚˈsɛlfwəz|əsɛːɫl̩fw|base_difference|
|25|25|∅ → ̩|ˈsɛlfwəzl|ɛːɫl̩fwʌz|mark_difference|
|27|28|ə → ʌ|ɛlfwəzlaɪ|l̩fwʌzlaʲ|base_difference|
|31|32|ɪ → ʲ|əzlaɪkˈtɑ|ʌzlaʲktɑː|mixed_alignment|
|33|34|ˈ → ∅|laɪkˈtɑːn|laʲktɑːnɪ|mark_difference|
|42|42|ˈ → ∅|ɪktəˈfɪlə|ɪktəfɪlɪp|mark_difference|
|46|45|ə → ɪ|ˈfɪləp|əfɪlɪp|base_difference|

以上差异均待听辨确认；无可信音素时间边界，因此不自动裁切“音素片段”。

### v4 新头
输出：`həʴõnbiʦʴɹeːɫːɫʌvɦəsɛːɫfwʌzlːaːktɑnɪktəfɪːlɪp`

|参考偏移|输出偏移|参考→输出|参考上下文|输出上下文|差异类型|
|---:|---:|---|---|---|---|
|1|1|∅ → ə|hɚoʊn̪|həʴõn|base_difference|
|1|2|ɚ → ʴ|hɚoʊn̪|həʴõnb|mixed_alignment|
|3|4|ʊ → ̃|hɚoʊn̪͡m|həʴõnbit|mixed_alignment|
|5|6|̪ → ∅|ɚoʊn̪͡mbɪ|ʴõnbit͡s|mark_difference|
|6|6|͡ → b|oʊn̪͡mbɪˈ|ʴõnbit͡s|mixed_alignment|
|7|7|m → i|ʊn̪͡mbɪˈt|õnbit͡sʴ|base_difference|
|8|8|b → t|n̪͡mbɪˈtɹ|̃nbit͡sʴɹ|base_difference|
|9|9|ɪ → ͡|̪͡mbɪˈtɹe|nbit͡sʴɹe|mixed_alignment|
|10|10|ˈ → s|͡mbɪˈtɹeɪ|bit͡sʴɹeː|mixed_alignment|
|11|11|t → ʴ|mbɪˈtɹeɪə|it͡sʴɹeːɫ|mixed_alignment|
|14|14|ɪ → ː|ˈtɹeɪələv|sʴɹeːɫːɫʌ|mixed_alignment|
|15|15|ə → ɫ|tɹeɪələvh|ʴɹeːɫːɫʌv|base_difference|
|16|16|l → ː|ɹeɪələvhɚ|ɹeːɫːɫʌvɦ|mixed_alignment|
|17|17|ə → ɫ|eɪələvhɚˈ|eːɫːɫʌvɦə|base_difference|
|18|18|v → ʌ|ɪələvhɚˈs|ːɫːɫʌvɦəs|base_difference|
|19|19|h → v|ələvhɚˈsɛ|ɫːɫʌvɦəsɛ|base_difference|
|20|20|ɚ → ɦ|ləvhɚˈsɛl|ːɫʌvɦəsɛː|base_difference|
|21|21|ˈ → ə|əvhɚˈsɛlf|ɫʌvɦəsɛːɫ|mixed_alignment|
|24|24|∅ → ː|ɚˈsɛlfwəz|ɦəsɛːɫfwʌ|mark_difference|
|24|25|l → ɫ|ɚˈsɛlfwəz|əsɛːɫfwʌz|base_difference|
|27|28|ə → ʌ|ɛlfwəzlaɪ|ːɫfwʌzlːa|base_difference|
|30|31|∅ → ː|wəzlaɪkˈt|wʌzlːaːkt|mark_difference|
|31|33|ɪ → ː|əzlaɪkˈtɑ|zlːaːktɑn|mixed_alignment|
|33|35|ˈ → ∅|laɪkˈtɑːn|ːaːktɑnɪk|mark_difference|
|36|37|ː → ∅|kˈtɑːnɪkt|ːktɑnɪktə|mark_difference|
|42|42|ˈ → ∅|ɪktəˈfɪlə|ɪktəfɪːlɪ|mark_difference|
|45|44|∅ → ː|əˈfɪləp|təfɪːlɪp|mark_difference|
|46|46|ə → ɪ|ˈfɪləp|fɪːlɪp|base_difference|

以上差异均待听辨确认；无可信音素时间边界，因此不自动裁切“音素片段”。

## listen-02
Every bone in her aged body seemed broken or dislocated.
[原录音](/Users/river/Documents/Libitu/.cache/sound-pilot/ipa-probe-v3-20261109/audio/listen-02.wav)

既有参考：`ˈevri boʊn ɪn hɚ ˈeɪdʒd ˈbɑːɾi siːmd ˈbroʊkən ɔɹ ˌdɪsˈloʊkeɪɾɪd`

### 原模型
输出：`ɛvɹiboʊnɪnhɜːɹeɪdʒᵻdbɑːdisiːmdbɹoʊkənɔːɹdɪsloʊkeɪɾᵻd`

|参考偏移|输出偏移|参考→输出|参考上下文|输出上下文|差异类型|
|---:|---:|---|---|---|---|
|0|0|ˈ → ∅|ˈevri|ɛvɹib|mark_difference|
|1|0|e → ɛ|ˈevrib|ɛvɹib|base_difference|
|3|2|r → ɹ|ˈevriboʊ|ɛvɹiboʊ|base_difference|
|12|11|∅ → ɜ|nɪnhɚˈeɪd|nɪnhɜːɹeɪ|base_difference|
|12|12|ɚ → ː|nɪnhɚˈeɪd|ɪnhɜːɹeɪd|mixed_alignment|
|13|13|ˈ → ɹ|ɪnhɚˈeɪdʒ|nhɜːɹeɪdʒ|mixed_alignment|
|18|18|d → ᵻ|eɪdʒdˈbɑː|eɪdʒᵻdbɑː|base_difference|
|19|19|ˈ → d|ɪdʒdˈbɑːɾ|ɪdʒᵻdbɑːd|mixed_alignment|
|23|23|ɾ → d|ˈbɑːɾisiː|dbɑːdisiː|base_difference|
|30|30|ˈ → ∅|iːmdˈbroʊ|iːmdbɹoʊk|mark_difference|
|32|31|r → ɹ|mdˈbroʊkə|ːmdbɹoʊkə|base_difference|
|39|38|ɹ → ː|kənɔɹˌdɪs|kənɔːɹdɪs|mixed_alignment|
|40|39|ˌ → ɹ|ənɔɹˌdɪsˈ|ənɔːɹdɪsl|mixed_alignment|
|44|43|ˈ → ∅|ˌdɪsˈloʊk|ɹdɪsloʊke|mark_difference|
|52|50|ɪ → ᵻ|keɪɾɪd|keɪɾᵻd|base_difference|

以上差异均待听辨确认；无可信音素时间边界，因此不自动裁切“音素片段”。

### 上一轮 549 条
输出：`ɛːvɹiːboːnɪnhəʴeːʤədbɑːdiːsiːmdbɹoːʷkənɑːdɪsːloːkʰeːɾəd`

|参考偏移|输出偏移|参考→输出|参考上下文|输出上下文|差异类型|
|---:|---:|---|---|---|---|
|0|0|ˈ → ɛ|ˈevri|ɛːvɹi|mixed_alignment|
|1|1|e → ː|ˈevrib|ɛːvɹiː|mixed_alignment|
|3|3|r → ɹ|ˈevriboʊ|ɛːvɹiːbo|base_difference|
|5|5|∅ → ː|evriboʊnɪ|ːvɹiːboːn|mark_difference|
|7|8|ʊ → ː|riboʊnɪnh|iːboːnɪnh|mixed_alignment|
|12|13|ɚ → ə|nɪnhɚˈeɪd|nɪnhəʴeːd|base_difference|
|13|14|ˈ → ʴ|ɪnhɚˈeɪdʒ|ɪnhəʴeːd͡|mark_difference|
|15|16|ɪ → ː|hɚˈeɪdʒdˈ|həʴeːd͡ʒə|mixed_alignment|
|17|18|∅ → ͡|ˈeɪdʒdˈbɑ|ʴeːd͡ʒədb|mark_difference|
|18|20|d → ə|eɪdʒdˈbɑː|ːd͡ʒədbɑː|base_difference|
|19|21|ˈ → d|ɪdʒdˈbɑːɾ|d͡ʒədbɑːd|mixed_alignment|
|23|25|ɾ → d|ˈbɑːɾisiː|dbɑːdiːsi|base_difference|
|25|27|∅ → ː|ɑːɾisiːmd|ɑːdiːsiːm|mark_difference|
|30|33|ˈ → ∅|iːmdˈbroʊ|iːmdbɹoːʷ|mark_difference|
|32|34|r → ɹ|mdˈbroʊkə|ːmdbɹoːʷk|base_difference|
|34|36|∅ → ː|ˈbroʊkənɔ|dbɹoːʷkən|mark_difference|
|34|37|ʊ → ʷ|ˈbroʊkənɔ|bɹoːʷkənɑ|mixed_alignment|
|38|41|ɔ → ∅|ʊkənɔɹˌdɪ|ʷkənɑːdɪs|base_difference|
|39|41|ɹ → ɑ|kənɔɹˌdɪs|ʷkənɑːdɪs|base_difference|
|40|42|ˌ → ː|ənɔɹˌdɪsˈ|kənɑːdɪsː|mark_difference|
|44|46|ˈ → ː|ˌdɪsˈloʊk|ːdɪsːloːk|mark_difference|
|47|49|ʊ → ː|sˈloʊkeɪɾ|sːloːkʰeː|mixed_alignment|
|49|51|∅ → ʰ|loʊkeɪɾɪd|loːkʰeːɾə|mark_difference|
|50|53|ɪ → ː|oʊkeɪɾɪd|ːkʰeːɾəd|mixed_alignment|
|52|55|ɪ → ə|keɪɾɪd|ʰeːɾəd|base_difference|

以上差异均待听辨确认；无可信音素时间边界，因此不自动裁切“音素片段”。

### v4 新头
输出：`ɛvɹiːbõnɪnhəʴeːʤədbɑdisimdbʴɹõʷkənɑdɪsːlõːkeːɾəd`

|参考偏移|输出偏移|参考→输出|参考上下文|输出上下文|差异类型|
|---:|---:|---|---|---|---|
|0|0|ˈ → ∅|ˈevri|ɛvɹiː|mark_difference|
|1|0|e → ɛ|ˈevrib|ɛvɹiː|base_difference|
|3|2|r → ɹ|ˈevriboʊ|ɛvɹiːbo|base_difference|
|5|4|∅ → ː|evriboʊnɪ|ɛvɹiːbõn|mark_difference|
|7|7|ʊ → ̃|riboʊnɪnh|iːbõnɪnh|mixed_alignment|
|12|12|ɚ → ə|nɪnhɚˈeɪd|nɪnhəʴeːd|base_difference|
|13|13|ˈ → ʴ|ɪnhɚˈeɪdʒ|ɪnhəʴeːd͡|mark_difference|
|15|15|ɪ → ː|hɚˈeɪdʒdˈ|həʴeːd͡ʒə|mixed_alignment|
|17|17|∅ → ͡|ˈeɪdʒdˈbɑ|ʴeːd͡ʒədb|mark_difference|
|18|19|d → ə|eɪdʒdˈbɑː|ːd͡ʒədbɑd|base_difference|
|19|20|ˈ → d|ɪdʒdˈbɑːɾ|d͡ʒədbɑdi|mixed_alignment|
|22|23|ː → ∅|dˈbɑːɾisi|ədbɑdisim|mark_difference|
|23|23|ɾ → d|ˈbɑːɾisiː|ədbɑdisim|base_difference|
|27|27|ː → ∅|ɾisiːmdˈb|disimdbʴɹ|mark_difference|
|30|29|ˈ → b|iːmdˈbroʊ|simdbʴɹõ|mixed_alignment|
|31|30|b → ʴ|ːmdˈbroʊk|imdbʴɹõʷ|mixed_alignment|
|32|31|r → ɹ|mdˈbroʊkə|mdbʴɹõʷk|base_difference|
|34|33|∅ → ̃|ˈbroʊkənɔ|bʴɹõʷkən|mark_difference|
|34|34|ʊ → ʷ|ˈbroʊkənɔ|ʴɹõʷkənɑ|mixed_alignment|
|38|38|ɔ → ∅|ʊkənɔɹˌdɪ|ʷkənɑdɪsː|base_difference|
|39|38|ɹ → ∅|kənɔɹˌdɪs|ʷkənɑdɪsː|base_difference|
|40|38|ˌ → ɑ|ənɔɹˌdɪsˈ|ʷkənɑdɪsː|mixed_alignment|
|44|42|ˈ → ː|ˌdɪsˈloʊk|ɑdɪsːlõː|mark_difference|
|47|45|∅ → ̃|sˈloʊkeɪɾ|sːlõːkeː|mark_difference|
|47|46|ʊ → ː|sˈloʊkeɪɾ|ːlõːkeːɾ|mixed_alignment|
|50|49|ɪ → ː|oʊkeɪɾɪd|̃ːkeːɾəd|mixed_alignment|
|52|51|ɪ → ə|keɪɾɪd|keːɾəd|base_difference|

以上差异均待听辨确认；无可信音素时间边界，因此不自动裁切“音素片段”。

## listen-05
I was about to do this when cooler judgment prevailed.
[原录音](/Users/river/Documents/Libitu/.cache/sound-pilot/ipa-probe-v3-20261109/audio/listen-05.wav)

既有参考：`aɪ wəz əˈbaʊʔ tə duː ðɪs weŋ ˈkuːlər ˈdʒʌdʒmənt prɪˈveɪld`

### 原模型
输出：`aɪwʌzɐbaʊttəduːðɪswɛnkuːlɚdʒʌdʒməntpɹᵻveɪld`

|参考偏移|输出偏移|参考→输出|参考上下文|输出上下文|差异类型|
|---:|---:|---|---|---|---|
|3|3|ə → ʌ|aɪwəzəˈb|aɪwʌzɐba|base_difference|
|5|5|ə → ∅|ɪwəzəˈbaʊ|ɪwʌzɐbaʊt|base_difference|
|6|5|ˈ → ɐ|wəzəˈbaʊʔ|ɪwʌzɐbaʊt|mixed_alignment|
|10|9|ʔ → t|ˈbaʊʔtədu|ɐbaʊttədu|base_difference|
|20|19|e → ∅|ðɪsweŋˈku|ðɪswɛnkuː|base_difference|
|21|19|ŋ → ɛ|ɪsweŋˈkuː|ðɪswɛnkuː|base_difference|
|22|20|ˈ → n|sweŋˈkuːl|ɪswɛnkuːl|mixed_alignment|
|27|25|ə → ∅|kuːlərˈdʒ|kuːlɚdʒʌd|base_difference|
|28|25|r → ∅|uːlərˈdʒʌ|kuːlɚdʒʌd|base_difference|
|29|25|ˈ → ɚ|ːlərˈdʒʌd|kuːlɚdʒʌd|mixed_alignment|
|40|36|r → ∅|əntprɪˈve|əntpɹᵻveɪ|base_difference|
|41|36|ɪ → ɹ|ntprɪˈveɪ|əntpɹᵻveɪ|base_difference|
|42|37|ˈ → ᵻ|tprɪˈveɪl|ntpɹᵻveɪl|mixed_alignment|

以上差异均待听辨确认；无可信音素时间边界，因此不自动裁切“音素片段”。

### 上一轮 549 条
输出：`aːwʌzəbaʷʔtəduːdɪswɛːnkʰuːləʤʌʤmən͡ʔpʴɹəveːɫ̩ː͡d`

|参考偏移|输出偏移|参考→输出|参考上下文|输出上下文|差异类型|
|---:|---:|---|---|---|---|
|1|1|ɪ → ː|aɪwəzə|aːwʌzə|mixed_alignment|
|3|3|ə → ʌ|aɪwəzəˈb|aːwʌzəba|base_difference|
|6|6|ˈ → ∅|wəzəˈbaʊʔ|wʌzəbaʷʔt|mark_difference|
|9|8|ʊ → ʷ|əˈbaʊʔtəd|zəbaʷʔtəd|mixed_alignment|
|16|15|ð → d|əduːðɪswe|əduːdɪswɛ|base_difference|
|20|19|e → ɛ|ðɪsweŋˈku|dɪswɛːnkʰ|base_difference|
|21|20|ŋ → ː|ɪsweŋˈkuː|ɪswɛːnkʰu|mixed_alignment|
|22|21|ˈ → n|sweŋˈkuːl|swɛːnkʰuː|mixed_alignment|
|24|23|∅ → ʰ|eŋˈkuːlər|ɛːnkʰuːlə|mark_difference|
|28|28|r → ∅|uːlərˈdʒʌ|uːləd͡ʒʌd|base_difference|
|29|28|ˈ → d|ːlərˈdʒʌd|uːləd͡ʒʌd|mixed_alignment|
|30|29|d → ͡|lərˈdʒʌdʒ|ːləd͡ʒʌd͡|mixed_alignment|
|34|33|∅ → ͡|dʒʌdʒmənt|͡ʒʌd͡ʒmən|mark_difference|
|38|38|∅ → ͡|ʒməntprɪˈ|ʒmən͡ʔpʴɹ|mark_difference|
|38|39|t → ʔ|ʒməntprɪˈ|mən͡ʔpʴɹə|base_difference|
|40|41|r → ʴ|əntprɪˈve|n͡ʔpʴɹəve|mixed_alignment|
|41|42|ɪ → ɹ|ntprɪˈveɪ|͡ʔpʴɹəveː|base_difference|
|42|43|ˈ → ə|tprɪˈveɪl|ʔpʴɹəveːɫ|mixed_alignment|
|45|46|∅ → ː|ɪˈveɪld|ɹəveːɫ̩ː͡|mark_difference|
|45|47|∅ → ɫ|ɪˈveɪld|əveːɫ̩ː͡d|base_difference|
|45|48|∅ → ̩|ɪˈveɪld|veːɫ̩ː͡d|mark_difference|
|45|49|ɪ → ː|ɪˈveɪld|eːɫ̩ː͡d|mixed_alignment|
|46|50|l → ͡|ˈveɪld|ːɫ̩ː͡d|mixed_alignment|

以上差异均待听辨确认；无可信音素时间边界，因此不自动裁切“音素片段”。

### v4 新头
输出：`aːwʌzəbaːʷʔttədudɪswɛnkuːləʤʌʤmn͡ʔpʴəveːːɫː͡d`

|参考偏移|输出偏移|参考→输出|参考上下文|输出上下文|差异类型|
|---:|---:|---|---|---|---|
|1|1|ɪ → ː|aɪwəzə|aːwʌzə|mixed_alignment|
|3|3|ə → ʌ|aɪwəzəˈb|aːwʌzəba|base_difference|
|6|6|ˈ → ∅|wəzəˈbaʊʔ|wʌzəbaːʷʔ|mark_difference|
|9|8|∅ → ː|əˈbaʊʔtəd|zəbaːʷʔtt|mark_difference|
|9|9|ʊ → ʷ|əˈbaʊʔtəd|əbaːʷʔttə|mixed_alignment|
|11|11|∅ → t|baʊʔtəduː|aːʷʔttədu|base_difference|
|15|16|ː → ∅|təduːðɪsw|tədudɪswɛ|mark_difference|
|16|16|ð → d|əduːðɪswe|tədudɪswɛ|base_difference|
|20|20|e → ∅|ðɪsweŋˈku|dɪswɛnkuː|base_difference|
|21|20|ŋ → ɛ|ɪsweŋˈkuː|dɪswɛnkuː|base_difference|
|22|21|ˈ → n|sweŋˈkuːl|ɪswɛnkuːl|mixed_alignment|
|28|27|r → ∅|uːlərˈdʒʌ|uːləd͡ʒʌd|base_difference|
|29|27|ˈ → d|ːlərˈdʒʌd|uːləd͡ʒʌd|mixed_alignment|
|30|28|d → ͡|lərˈdʒʌdʒ|ːləd͡ʒʌd͡|mixed_alignment|
|34|32|∅ → ͡|dʒʌdʒmənt|͡ʒʌd͡ʒmn͡|mark_difference|
|36|35|ə → ∅|ʌdʒməntpr|d͡ʒmn͡ʔpʴ|base_difference|
|38|36|t → ͡|ʒməntprɪˈ|͡ʒmn͡ʔpʴə|mixed_alignment|
|39|37|p → ʔ|məntprɪˈv|ʒmn͡ʔpʴəv|base_difference|
|40|38|r → p|əntprɪˈve|mn͡ʔpʴəve|base_difference|
|41|39|ɪ → ʴ|ntprɪˈveɪ|n͡ʔpʴəveː|mixed_alignment|
|42|40|ˈ → ə|tprɪˈveɪl|͡ʔpʴəveːː|mixed_alignment|
|45|43|∅ → ː|ɪˈveɪld|ʴəveːːɫː͡|mark_difference|
|45|44|∅ → ː|ɪˈveɪld|əveːːɫː͡d|mark_difference|
|45|45|∅ → ɫ|ɪˈveɪld|veːːɫː͡d|base_difference|
|45|46|ɪ → ː|ɪˈveɪld|eːːɫː͡d|mixed_alignment|
|46|47|l → ͡|ˈveɪld|ːːɫː͡d|mixed_alignment|

以上差异均待听辨确认；无可信音素时间边界，因此不自动裁切“音素片段”。

## listen-06
Everything was working smoothly, better than I had expected.
[原录音](/Users/river/Documents/Libitu/.cache/sound-pilot/ipa-probe-v3-20261109/audio/listen-06.wav)

既有参考：`ˈevriθɪŋ wəz ˈwɜːrkɪŋ ˈsmuːðli ˈbeɾɚ ðæn aɪ hæd ɪkˈspektɪd`

### 原模型
输出：`ɛvɹiθɪŋwʌzwɜːkɪŋsmuːðlibɛɾɚðɛnaɪhædɛkspɛktᵻd`

|参考偏移|输出偏移|参考→输出|参考上下文|输出上下文|差异类型|
|---:|---:|---|---|---|---|
|0|0|ˈ → ∅|ˈevri|ɛvɹiθ|mark_difference|
|1|0|e → ɛ|ˈevriθ|ɛvɹiθ|base_difference|
|3|2|r → ɹ|ˈevriθɪŋ|ɛvɹiθɪŋ|base_difference|
|9|8|ə → ʌ|θɪŋwəzˈwɜ|θɪŋwʌzwɜː|base_difference|
|11|10|ˈ → ∅|ŋwəzˈwɜːr|ŋwʌzwɜːkɪ|mark_difference|
|15|13|r → ∅|ˈwɜːrkɪŋˈ|zwɜːkɪŋsm|base_difference|
|19|16|ˈ → ∅|rkɪŋˈsmuː|ːkɪŋsmuːð|mark_difference|
|27|23|ˈ → ∅|ːðliˈbeɾɚ|ːðlibɛɾɚð|mark_difference|
|29|24|e → ɛ|liˈbeɾɚðæ|ðlibɛɾɚðɛ|base_difference|
|33|28|æ → ɛ|eɾɚðænaɪh|ɛɾɚðɛnaɪh|base_difference|
|40|35|ɪ → ɛ|ɪhædɪkˈsp|ɪhædɛkspɛ|base_difference|
|42|37|ˈ → ∅|ædɪkˈspek|ædɛkspɛkt|mark_difference|
|45|39|e → ɛ|kˈspektɪd|ɛkspɛktᵻd|base_difference|
|48|42|ɪ → ᵻ|pektɪd|pɛktᵻd|base_difference|

以上差异均待听辨确认；无可信音素时间边界，因此不自动裁切“音素片段”。

### 上一轮 549 条
输出：`ɛːvɹiːt̪ɪŋgwʌzwʴkʰɪːŋsmuːdliːbɛːɾəd̪ɛːnaːʲhæːdɛːksp̪ɛːktɪd`

|参考偏移|输出偏移|参考→输出|参考上下文|输出上下文|差异类型|
|---:|---:|---|---|---|---|
|0|0|ˈ → ɛ|ˈevri|ɛːvɹi|mixed_alignment|
|1|1|e → ː|ˈevriθ|ɛːvɹiː|mixed_alignment|
|3|3|r → ɹ|ˈevriθɪŋ|ɛːvɹiːt̪|base_difference|
|5|5|∅ → ː|evriθɪŋwə|ːvɹiːt̪ɪŋ|mark_difference|
|5|6|∅ → t|evriθɪŋwə|vɹiːt̪ɪŋɡ|base_difference|
|5|7|θ → ̪|evriθɪŋwə|ɹiːt̪ɪŋɡw|mixed_alignment|
|8|10|∅ → ɡ|iθɪŋwəzˈw|t̪ɪŋɡwʌzw|base_difference|
|9|12|ə → ʌ|θɪŋwəzˈwɜ|ɪŋɡwʌzwʴk|base_difference|
|11|14|ˈ → ∅|ŋwəzˈwɜːr|ɡwʌzwʴkʰɪ|mark_difference|
|13|15|ɜ → ∅|əzˈwɜːrkɪ|wʌzwʴkʰɪː|base_difference|
|14|15|ː → ʴ|zˈwɜːrkɪŋ|wʌzwʴkʰɪː|mark_difference|
|15|16|r → k|ˈwɜːrkɪŋˈ|ʌzwʴkʰɪːŋ|base_difference|
|16|17|k → ʰ|wɜːrkɪŋˈs|zwʴkʰɪːŋs|mixed_alignment|
|18|19|ŋ → ː|ːrkɪŋˈsmu|ʴkʰɪːŋsmu|mixed_alignment|
|19|20|ˈ → ŋ|rkɪŋˈsmuː|kʰɪːŋsmuː|mixed_alignment|
|24|25|ð → d|smuːðliˈb|smuːdliːb|base_difference|
|27|28|ˈ → ː|ːðliˈbeɾɚ|ːdliːbɛːɾ|mark_difference|
|29|30|∅ → ɛ|liˈbeɾɚðæ|liːbɛːɾəd|base_difference|
|29|31|e → ː|liˈbeɾɚðæ|iːbɛːɾəd̪|mixed_alignment|
|31|33|∅ → ə|ˈbeɾɚðæna|bɛːɾəd̪ɛː|base_difference|
|31|34|∅ → d|ˈbeɾɚðæna|ɛːɾəd̪ɛːn|base_difference|
|31|35|ɚ → ̪|ˈbeɾɚðæna|ːɾəd̪ɛːna|mixed_alignment|
|32|36|ð → ɛ|beɾɚðænaɪ|ɾəd̪ɛːnaː|base_difference|
|33|37|æ → ː|eɾɚðænaɪh|əd̪ɛːnaːʲ|mixed_alignment|
|36|40|∅ → ː|ðænaɪhædɪ|ɛːnaːʲhæː|mark_difference|
|36|41|ɪ → ʲ|ðænaɪhædɪ|ːnaːʲhæːd|mixed_alignment|
|39|44|∅ → ː|aɪhædɪkˈs|ːʲhæːdɛːk|mark_difference|
|40|46|ɪ → ɛ|ɪhædɪkˈsp|hæːdɛːksp|base_difference|
|41|47|k → ː|hædɪkˈspe|æːdɛːksp̪|mixed_alignment|
|42|48|ˈ → k|ædɪkˈspek|ːdɛːksp̪ɛ|mixed_alignment|
|45|51|∅ → ̪|kˈspektɪd|ːksp̪ɛːkt|mark_difference|
|45|52|∅ → ɛ|kˈspektɪd|ksp̪ɛːktɪ|base_difference|
|45|53|e → ː|kˈspektɪd|sp̪ɛːktɪd|mixed_alignment|

以上差异均待听辨确认；无可信音素时间边界，因此不自动裁切“音素片段”。

### v4 新头
输出：`ɛvɹiː̪ɪŋʲwʌzwʴːkɪŋsmuːdːlːibɛɾəd̪ɛnaːʲhædɛksp̪ɛkɾɪd`

|参考偏移|输出偏移|参考→输出|参考上下文|输出上下文|差异类型|
|---:|---:|---|---|---|---|
|0|0|ˈ → ∅|ˈevri|ɛvɹiː|mark_difference|
|1|0|e → ɛ|ˈevriθ|ɛvɹiː|base_difference|
|3|2|r → ɹ|ˈevriθɪŋ|ɛvɹiː̪ɪ|base_difference|
|5|4|∅ → ː|evriθɪŋwə|ɛvɹiː̪ɪŋʲ|mark_difference|
|5|5|θ → ̪|evriθɪŋwə|vɹiː̪ɪŋʲw|mixed_alignment|
|8|8|∅ → ʲ|iθɪŋwəzˈw|ː̪ɪŋʲwʌzw|mark_difference|
|9|10|ə → ʌ|θɪŋwəzˈwɜ|ɪŋʲwʌzwʴː|base_difference|
|11|12|ˈ → ∅|ŋwəzˈwɜːr|ʲwʌzwʴːkɪ|mark_difference|
|13|13|ɜ → ʴ|əzˈwɜːrkɪ|wʌzwʴːkɪŋ|mixed_alignment|
|15|15|r → ∅|ˈwɜːrkɪŋˈ|zwʴːkɪŋsm|base_difference|
|19|18|ˈ → ∅|rkɪŋˈsmuː|ːkɪŋsmuːd|mark_difference|
|24|22|∅ → d|smuːðliˈb|smuːdːlːi|base_difference|
|24|23|ð → ː|smuːðliˈb|muːdːlːib|mixed_alignment|
|26|25|i → ː|uːðliˈbeɾ|ːdːlːibɛɾ|mixed_alignment|
|27|26|ˈ → i|ːðliˈbeɾɚ|dːlːibɛɾə|mixed_alignment|
|29|28|e → ɛ|liˈbeɾɚðæ|lːibɛɾəd̪|base_difference|
|31|30|∅ → ə|ˈbeɾɚðæna|ibɛɾəd̪ɛn|base_difference|
|31|31|ɚ → d|ˈbeɾɚðæna|bɛɾəd̪ɛna|base_difference|
|32|32|ð → ̪|beɾɚðænaɪ|ɛɾəd̪ɛnaː|mixed_alignment|
|33|33|æ → ɛ|eɾɚðænaɪh|ɾəd̪ɛnaːʲ|base_difference|
|36|36|∅ → ː|ðænaɪhædɪ|̪ɛnaːʲhæd|mark_difference|
|36|37|ɪ → ʲ|ðænaɪhædɪ|ɛnaːʲhædɛ|mixed_alignment|
|40|41|ɪ → ɛ|ɪhædɪkˈsp|ʲhædɛksp̪|base_difference|
|42|43|ˈ → ∅|ædɪkˈspek|ædɛksp̪ɛk|mark_difference|
|45|45|∅ → ̪|kˈspektɪd|ɛksp̪ɛkɾɪ|mark_difference|
|45|46|e → ɛ|kˈspektɪd|ksp̪ɛkɾɪd|base_difference|
|47|48|t → ɾ|spektɪd|p̪ɛkɾɪd|base_difference|

以上差异均待听辨确认；无可信音素时间边界，因此不自动裁切“音素片段”。

## listen-07
I was about to do this when cooler judgment prevailed.
[原录音](/Users/river/Documents/Libitu/.cache/sound-pilot/ipa-probe-v3-20261109/audio/listen-07.wav)

既有参考：`aɪ wəz əˈbaʊʔ tə duː ðɪs weŋ ˈkuːlər ˈdʒʌdʒmənt prɪˈveɪld`

### 原模型
输出：`aɪwʌzɐbaʊttəduːðɪswɛnkuːlɚdʒʌdʒməntpɹᵻveɪld`

|参考偏移|输出偏移|参考→输出|参考上下文|输出上下文|差异类型|
|---:|---:|---|---|---|---|
|3|3|ə → ʌ|aɪwəzəˈb|aɪwʌzɐba|base_difference|
|5|5|ə → ∅|ɪwəzəˈbaʊ|ɪwʌzɐbaʊt|base_difference|
|6|5|ˈ → ɐ|wəzəˈbaʊʔ|ɪwʌzɐbaʊt|mixed_alignment|
|10|9|ʔ → t|ˈbaʊʔtədu|ɐbaʊttədu|base_difference|
|20|19|e → ∅|ðɪsweŋˈku|ðɪswɛnkuː|base_difference|
|21|19|ŋ → ɛ|ɪsweŋˈkuː|ðɪswɛnkuː|base_difference|
|22|20|ˈ → n|sweŋˈkuːl|ɪswɛnkuːl|mixed_alignment|
|27|25|ə → ∅|kuːlərˈdʒ|kuːlɚdʒʌd|base_difference|
|28|25|r → ∅|uːlərˈdʒʌ|kuːlɚdʒʌd|base_difference|
|29|25|ˈ → ɚ|ːlərˈdʒʌd|kuːlɚdʒʌd|mixed_alignment|
|40|36|r → ∅|əntprɪˈve|əntpɹᵻveɪ|base_difference|
|41|36|ɪ → ɹ|ntprɪˈveɪ|əntpɹᵻveɪ|base_difference|
|42|37|ˈ → ᵻ|tprɪˈveɪl|ntpɹᵻveɪl|mixed_alignment|

以上差异均待听辨确认；无可信音素时间边界，因此不自动裁切“音素片段”。

### 上一轮 549 条
输出：`aːwʌzəbaʷʔtəduːdɪswʌnkʰuːləʤʌʤməntpɹəveːɫ̩d`

|参考偏移|输出偏移|参考→输出|参考上下文|输出上下文|差异类型|
|---:|---:|---|---|---|---|
|1|1|ɪ → ː|aɪwəzə|aːwʌzə|mixed_alignment|
|3|3|ə → ʌ|aɪwəzəˈb|aːwʌzəba|base_difference|
|6|6|ˈ → ∅|wəzəˈbaʊʔ|wʌzəbaʷʔt|mark_difference|
|9|8|ʊ → ʷ|əˈbaʊʔtəd|zəbaʷʔtəd|mixed_alignment|
|16|15|ð → d|əduːðɪswe|əduːdɪswʌ|base_difference|
|20|19|e → ʌ|ðɪsweŋˈku|dɪswʌnkʰu|base_difference|
|21|20|ŋ → n|ɪsweŋˈkuː|ɪswʌnkʰuː|base_difference|
|22|21|ˈ → k|sweŋˈkuːl|swʌnkʰuːl|mixed_alignment|
|23|22|k → ʰ|weŋˈkuːlə|wʌnkʰuːlə|mixed_alignment|
|28|27|r → ∅|uːlərˈdʒʌ|uːləd͡ʒʌd|base_difference|
|29|27|ˈ → d|ːlərˈdʒʌd|uːləd͡ʒʌd|mixed_alignment|
|30|28|d → ͡|lərˈdʒʌdʒ|ːləd͡ʒʌd͡|mixed_alignment|
|34|32|∅ → ͡|dʒʌdʒmənt|͡ʒʌd͡ʒmən|mark_difference|
|40|39|r → ∅|əntprɪˈve|əntpɹəveː|base_difference|
|41|39|ɪ → ɹ|ntprɪˈveɪ|əntpɹəveː|base_difference|
|42|40|ˈ → ə|tprɪˈveɪl|ntpɹəveːɫ|mixed_alignment|
|45|43|∅ → ː|ɪˈveɪld|ɹəveːɫ̩d|mark_difference|
|45|44|ɪ → ɫ|ɪˈveɪld|əveːɫ̩d|base_difference|
|46|45|l → ̩|ˈveɪld|veːɫ̩d|mixed_alignment|

以上差异均待听辨确认；无可信音素时间边界，因此不自动裁切“音素片段”。

### v4 新头
输出：`aːwʌzəbaːʷʔttəduːdɪswɛnkuːləʤʌʤmntpʴəveːːɫːd`

|参考偏移|输出偏移|参考→输出|参考上下文|输出上下文|差异类型|
|---:|---:|---|---|---|---|
|1|1|ɪ → ː|aɪwəzə|aːwʌzə|mixed_alignment|
|3|3|ə → ʌ|aɪwəzəˈb|aːwʌzəba|base_difference|
|6|6|ˈ → ∅|wəzəˈbaʊʔ|wʌzəbaːʷʔ|mark_difference|
|9|8|∅ → ː|əˈbaʊʔtəd|zəbaːʷʔtt|mark_difference|
|9|9|ʊ → ʷ|əˈbaʊʔtəd|əbaːʷʔttə|mixed_alignment|
|11|11|∅ → t|baʊʔtəduː|aːʷʔttədu|base_difference|
|16|17|ð → d|əduːðɪswe|əduːdɪswɛ|base_difference|
|20|21|e → ∅|ðɪsweŋˈku|dɪswɛnkuː|base_difference|
|21|21|ŋ → ɛ|ɪsweŋˈkuː|dɪswɛnkuː|base_difference|
|22|22|ˈ → n|sweŋˈkuːl|ɪswɛnkuːl|mixed_alignment|
|28|28|r → ∅|uːlərˈdʒʌ|uːləd͡ʒʌd|base_difference|
|29|28|ˈ → d|ːlərˈdʒʌd|uːləd͡ʒʌd|mixed_alignment|
|30|29|d → ͡|lərˈdʒʌdʒ|ːləd͡ʒʌd͡|mixed_alignment|
|34|33|∅ → ͡|dʒʌdʒmənt|͡ʒʌd͡ʒmnt|mark_difference|
|36|36|ə → ∅|ʌdʒməntpr|d͡ʒmntpʴə|base_difference|
|40|39|r → ∅|əntprɪˈve|mntpʴəveː|base_difference|
|41|39|ɪ → ʴ|ntprɪˈveɪ|mntpʴəveː|mixed_alignment|
|42|40|ˈ → ə|tprɪˈveɪl|ntpʴəveːː|mixed_alignment|
|45|43|∅ → ː|ɪˈveɪld|ʴəveːːɫːd|mark_difference|
|45|44|∅ → ː|ɪˈveɪld|əveːːɫːd|mark_difference|
|45|45|ɪ → ɫ|ɪˈveɪld|veːːɫːd|base_difference|
|46|46|l → ː|ˈveɪld|eːːɫːd|mixed_alignment|

以上差异均待听辨确认；无可信音素时间边界，因此不自动裁切“音素片段”。

## listen-08
And now, down there, Eileen was waiting for him.
[原录音](/Users/river/Documents/Libitu/.cache/sound-pilot/ipa-probe-v3-20261109/audio/listen-08.wav)

既有参考：`ən naʊ daʊn ðer aɪˈliːn wəz ˈweɪɾɪŋ fɔːr ɪm`

### 原模型
输出：`ændnaʊdaʊnðɛɹaɪliːnwʌzweɪɾɪŋfɚhɪm`

|参考偏移|输出偏移|参考→输出|参考上下文|输出上下文|差异类型|
|---:|---:|---|---|---|---|
|0|0|ə → æ|ənnaʊ|ændna|base_difference|
|2|2|∅ → d|ənnaʊda|ændnaʊd|base_difference|
|10|11|e → ɛ|aʊnðeraɪˈ|aʊnðɛɹaɪl|base_difference|
|11|12|r → ɹ|ʊnðeraɪˈl|ʊnðɛɹaɪli|base_difference|
|14|15|ˈ → ∅|eraɪˈliːn|ɛɹaɪliːnw|mark_difference|
|20|20|ə → ʌ|iːnwəzˈwe|iːnwʌzweɪ|base_difference|
|22|22|ˈ → ∅|nwəzˈweɪɾ|nwʌzweɪɾɪ|mark_difference|
|30|29|ɔ → ∅|ɾɪŋfɔːrɪm|ɾɪŋfɚhɪm|base_difference|
|31|29|ː → ɚ|ɪŋfɔːrɪm|ɾɪŋfɚhɪm|mixed_alignment|
|32|30|r → h|ŋfɔːrɪm|ɪŋfɚhɪm|base_difference|

以上差异均待听辨确认；无可信音素时间边界，因此不自动裁切“音素片段”。

### 上一轮 549 条
输出：`ændnɑːdandɛːʴaːliːnwʌzweːɾɪŋfəhɪːm`

|参考偏移|输出偏移|参考→输出|参考上下文|输出上下文|差异类型|
|---:|---:|---|---|---|---|
|0|0|ə → æ|ənnaʊ|ændnɑ|base_difference|
|2|2|∅ → d|ənnaʊda|ændnɑːd|base_difference|
|3|4|a → ɑ|ənnaʊdaʊ|ændnɑːdan|base_difference|
|4|5|ʊ → ː|ənnaʊdaʊn|ndnɑːdand|mixed_alignment|
|7|8|ʊ → ∅|aʊdaʊnðer|ɑːdandɛːʴ|base_difference|
|9|9|ð → d|daʊnðeraɪ|ːdandɛːʴa|base_difference|
|10|10|e → ɛ|aʊnðeraɪˈ|dandɛːʴaː|base_difference|
|11|11|r → ː|ʊnðeraɪˈl|andɛːʴaːl|mixed_alignment|
|12|12|a → ʴ|nðeraɪˈli|ndɛːʴaːli|mixed_alignment|
|13|13|ɪ → a|ðeraɪˈliː|dɛːʴaːliː|base_difference|
|14|14|ˈ → ː|eraɪˈliːn|ɛːʴaːliːn|mark_difference|
|20|20|ə → ʌ|iːnwəzˈwe|iːnwʌzweː|base_difference|
|22|22|ˈ → ∅|nwəzˈweɪɾ|nwʌzweːɾɪ|mark_difference|
|25|24|ɪ → ː|zˈweɪɾɪŋf|ʌzweːɾɪŋf|mixed_alignment|
|30|29|ɔ → ə|ɾɪŋfɔːrɪm|ɾɪŋfəhɪːm|base_difference|
|31|30|ː → h|ɪŋfɔːrɪm|ɪŋfəhɪːm|mixed_alignment|
|32|31|r → ɪ|ŋfɔːrɪm|ŋfəhɪːm|base_difference|
|33|32|ɪ → ː|fɔːrɪm|fəhɪːm|mixed_alignment|

以上差异均待听辨确认；无可信音素时间边界，因此不自动裁切“音素片段”。

### v4 新头
输出：`ændnaːʷdaʷndɛʴaːliːnwʌzweːɾɪŋfəɦɪm`

|参考偏移|输出偏移|参考→输出|参考上下文|输出上下文|差异类型|
|---:|---:|---|---|---|---|
|0|0|ə → æ|ənnaʊ|ændna|base_difference|
|2|2|∅ → d|ənnaʊda|ændnaːʷ|base_difference|
|4|5|∅ → ː|ənnaʊdaʊn|ndnaːʷdaʷ|mark_difference|
|4|6|ʊ → ʷ|ənnaʊdaʊn|dnaːʷdaʷn|mixed_alignment|
|7|9|ʊ → ʷ|aʊdaʊnðer|ːʷdaʷndɛʴ|mixed_alignment|
|9|11|ð → d|daʊnðeraɪ|daʷndɛʴaː|base_difference|
|10|12|e → ɛ|aʊnðeraɪˈ|aʷndɛʴaːl|base_difference|
|11|13|r → ʴ|ʊnðeraɪˈl|ʷndɛʴaːli|mixed_alignment|
|13|15|ɪ → ∅|ðeraɪˈliː|dɛʴaːliːn|base_difference|
|14|15|ˈ → ː|eraɪˈliːn|dɛʴaːliːn|mark_difference|
|20|21|ə → ʌ|iːnwəzˈwe|iːnwʌzweː|base_difference|
|22|23|ˈ → ∅|nwəzˈweɪɾ|nwʌzweːɾɪ|mark_difference|
|25|25|ɪ → ː|zˈweɪɾɪŋf|ʌzweːɾɪŋf|mixed_alignment|
|30|30|ɔ → ∅|ɾɪŋfɔːrɪm|ɾɪŋfəɦɪm|base_difference|
|31|30|ː → ə|ɪŋfɔːrɪm|ɾɪŋfəɦɪm|mixed_alignment|
|32|31|r → ɦ|ŋfɔːrɪm|ɪŋfəɦɪm|base_difference|

以上差异均待听辨确认；无可信音素时间边界，因此不自动裁切“音素片段”。

## listen-09
The Fire People, like ourselves, lived in caves.
[原录音](/Users/river/Documents/Libitu/.cache/sound-pilot/ipa-probe-v3-20261109/audio/listen-09.wav)

既有参考：`ə ˈfaɪɚ ˈpiːpl laɪk ɑːrˈsɛlvz lɪvd ɪŋ keɪvz`

### 原模型
输出：`ðəfaɪɚpiːpəllaɪkaʊsɛlvzlɪvdɪnkeɪvz`

|参考偏移|输出偏移|参考→输出|参考上下文|输出上下文|差异类型|
|---:|---:|---|---|---|---|
|0|0|ə → ð|əˈfaɪ|ðəfaɪ|base_difference|
|1|1|ˈ → ə|əˈfaɪɚ|ðəfaɪɚ|mixed_alignment|
|6|6|ˈ → ∅|faɪɚˈpiːp|faɪɚpiːpə|mark_difference|
|11|10|∅ → ə|piːpllaɪk|piːpəllaɪ|base_difference|
|16|16|ɑ → ∅|laɪkɑːrˈs|laɪkaʊsɛl|base_difference|
|17|16|ː → ∅|aɪkɑːrˈsɛ|laɪkaʊsɛl|mark_difference|
|18|16|r → a|ɪkɑːrˈsɛl|laɪkaʊsɛl|base_difference|
|19|17|ˈ → ʊ|kɑːrˈsɛlv|aɪkaʊsɛlv|mixed_alignment|
|30|28|ŋ → n|ɪvdɪŋkeɪv|ɪvdɪnkeɪv|base_difference|

以上差异均待听辨确认；无可信音素时间边界，因此不自动裁切“音素片段”。

### 上一轮 549 条
输出：`d̪əfaːʴpiːpɫlaʲkɑːʴsɛːɫlvzlɪvdɪnkʰeːvz`

|参考偏移|输出偏移|参考→输出|参考上下文|输出上下文|差异类型|
|---:|---:|---|---|---|---|
|0|0|∅ → d|əˈfaɪ|d̪əfa|base_difference|
|0|1|ə → ̪|əˈfaɪ|d̪əfaː|mixed_alignment|
|1|2|ˈ → ə|əˈfaɪɚ|d̪əfaːʴ|mixed_alignment|
|4|5|ɪ → ∅|əˈfaɪɚˈpi|̪əfaːʴpiː|base_difference|
|5|5|ɚ → ː|ˈfaɪɚˈpiː|̪əfaːʴpiː|mixed_alignment|
|6|6|ˈ → ʴ|faɪɚˈpiːp|əfaːʴpiːp|mark_difference|
|11|11|l → ɫ|piːpllaɪk|piːpɫlaʲk|base_difference|
|14|14|ɪ → ʲ|pllaɪkɑːr|pɫlaʲkɑːʴ|mixed_alignment|
|18|18|r → ∅|ɪkɑːrˈsɛl|ʲkɑːʴsɛːɫ|base_difference|
|19|18|ˈ → ʴ|kɑːrˈsɛlv|ʲkɑːʴsɛːɫ|mark_difference|
|22|21|∅ → ː|rˈsɛlvzlɪ|ːʴsɛːɫlvz|mark_difference|
|22|22|∅ → ɫ|rˈsɛlvzlɪ|ʴsɛːɫlvzl|base_difference|
|30|31|ŋ → n|ɪvdɪŋkeɪv|ɪvdɪnkʰeː|base_difference|
|32|33|∅ → ʰ|dɪŋkeɪvz|dɪnkʰeːvz|mark_difference|
|33|35|ɪ → ː|ɪŋkeɪvz|nkʰeːvz|mixed_alignment|

以上差异均待听辨确认；无可信音素时间边界，因此不自动裁切“音素片段”。

### v4 新头
输出：`̪əfaːʴpipɫːːlakaʴsɛːɫvzlɪvdɪnkeːvz`

|参考偏移|输出偏移|参考→输出|参考上下文|输出上下文|差异类型|
|---:|---:|---|---|---|---|
|0|0|ə → ̪|əˈfaɪ|̪əfaː|mixed_alignment|
|1|1|ˈ → ə|əˈfaɪɚ|̪əfaːʴ|mixed_alignment|
|4|4|ɪ → ∅|əˈfaɪɚˈpi|̪əfaːʴpip|base_difference|
|5|4|ɚ → ː|ˈfaɪɚˈpiː|̪əfaːʴpip|mixed_alignment|
|6|5|ˈ → ʴ|faɪɚˈpiːp|əfaːʴpipɫ|mark_difference|
|9|8|∅ → p|ɚˈpiːplla|ːʴpipɫːːl|base_difference|
|9|9|ː → ɫ|ɚˈpiːplla|ʴpipɫːːla|mixed_alignment|
|10|10|p → ː|ˈpiːpllaɪ|pipɫːːlak|mixed_alignment|
|11|11|l → ː|piːpllaɪk|ipɫːːlaka|mixed_alignment|
|14|14|ɪ → ∅|pllaɪkɑːr|ːːlakaʴsɛ|base_difference|
|16|15|ɑ → ∅|laɪkɑːrˈs|ːlakaʴsɛː|base_difference|
|17|15|ː → ∅|aɪkɑːrˈsɛ|ːlakaʴsɛː|mark_difference|
|18|15|r → a|ɪkɑːrˈsɛl|ːlakaʴsɛː|base_difference|
|19|16|ˈ → ʴ|kɑːrˈsɛlv|lakaʴsɛːɫ|mark_difference|
|22|19|∅ → ː|rˈsɛlvzlɪ|aʴsɛːɫvzl|mark_difference|
|22|20|l → ɫ|rˈsɛlvzlɪ|ʴsɛːɫvzlɪ|base_difference|
|30|28|ŋ → n|ɪvdɪŋkeɪv|ɪvdɪnkeːv|base_difference|
|33|31|ɪ → ː|ɪŋkeɪvz|ɪnkeːvz|mixed_alignment|

以上差异均待听辨确认；无可信音素时间边界，因此不自动裁切“音素片段”。

## listen-10
I was the only one who remained sitting.
[原录音](/Users/river/Documents/Libitu/.cache/sound-pilot/ipa-probe-v3-20261109/audio/listen-10.wav)

既有参考：`aɪ wəz ði ˈoʊnli wʌn huː rɪˈmeɪnd ˈsɪɾɪŋ`

### 原模型
输出：`aɪwʌzðɪoʊnliwʌnhuːɹᵻmeɪndsɪɾɪŋ`

|参考偏移|输出偏移|参考→输出|参考上下文|输出上下文|差异类型|
|---:|---:|---|---|---|---|
|3|3|ə → ʌ|aɪwəzðiˈ|aɪwʌzðɪo|base_difference|
|6|6|i → ∅|wəzðiˈoʊn|wʌzðɪoʊnl|base_difference|
|7|6|ˈ → ɪ|əzðiˈoʊnl|wʌzðɪoʊnl|mixed_alignment|
|19|18|r → ∅|nhuːrɪˈme|nhuːɹᵻmeɪ|base_difference|
|20|18|ɪ → ɹ|huːrɪˈmeɪ|nhuːɹᵻmeɪ|base_difference|
|21|19|ˈ → ᵻ|uːrɪˈmeɪn|huːɹᵻmeɪn|mixed_alignment|
|27|25|ˈ → ∅|eɪndˈsɪɾɪ|eɪndsɪɾɪŋ|mark_difference|

以上差异均待听辨确认；无可信音素时间边界，因此不自动裁切“音素片段”。

### 上一轮 549 条
输出：`aːwʌz̪ɪõn͡liːʲwʌnhuːʷɹəmeːn͡dsɪɾɪŋ`

|参考偏移|输出偏移|参考→输出|参考上下文|输出上下文|差异类型|
|---:|---:|---|---|---|---|
|1|1|ɪ → ː|aɪwəzð|aːwʌz̪|mixed_alignment|
|3|3|ə → ʌ|aɪwəzðiˈ|aːwʌz̪ɪo|base_difference|
|5|5|ð → ∅|ɪwəzðiˈoʊ|ːwʌz̪ɪõn|base_difference|
|6|5|i → ̪|wəzðiˈoʊn|ːwʌz̪ɪõn|mixed_alignment|
|7|6|ˈ → ɪ|əzðiˈoʊnl|wʌz̪ɪõn͡|mixed_alignment|
|9|8|ʊ → ̃|ðiˈoʊnliw|z̪ɪõn͡li|mixed_alignment|
|11|10|∅ → ͡|ˈoʊnliwʌn|ɪõn͡liːʲ|mark_difference|
|13|13|∅ → ː|ʊnliwʌnhu|n͡liːʲwʌn|mark_difference|
|13|14|∅ → ʲ|ʊnliwʌnhu|͡liːʲwʌnh|mark_difference|
|19|21|r → ʷ|nhuːrɪˈme|nhuːʷɹəme|mixed_alignment|
|20|22|ɪ → ɹ|huːrɪˈmeɪ|huːʷɹəmeː|base_difference|
|21|23|ˈ → ə|uːrɪˈmeɪn|uːʷɹəmeːn|mixed_alignment|
|24|26|ɪ → ː|ɪˈmeɪndˈs|ɹəmeːn͡ds|mixed_alignment|
|26|28|d → ͡|meɪndˈsɪɾ|meːn͡dsɪɾ|mixed_alignment|
|27|29|ˈ → d|eɪndˈsɪɾɪ|eːn͡dsɪɾɪ|mixed_alignment|

以上差异均待听辨确认；无可信音素时间边界，因此不自动裁切“音素片段”。

### v4 新头
输出：`awʌz̪ɪõn͡liːwʌnhuːʷɹəmeːn͡dsɪɾɪŋ`

|参考偏移|输出偏移|参考→输出|参考上下文|输出上下文|差异类型|
|---:|---:|---|---|---|---|
|1|1|ɪ → ∅|aɪwəzð|awʌz̪ɪ|base_difference|
|3|2|ə → ʌ|aɪwəzðiˈ|awʌz̪ɪo|base_difference|
|5|4|ð → ∅|ɪwəzðiˈoʊ|awʌz̪ɪõn|base_difference|
|6|4|i → ̪|wəzðiˈoʊn|awʌz̪ɪõn|mixed_alignment|
|7|5|ˈ → ɪ|əzðiˈoʊnl|wʌz̪ɪõn͡|mixed_alignment|
|9|7|ʊ → ̃|ðiˈoʊnliw|z̪ɪõn͡li|mixed_alignment|
|11|9|∅ → ͡|ˈoʊnliwʌn|ɪõn͡liːw|mark_difference|
|13|12|∅ → ː|ʊnliwʌnhu|n͡liːwʌnh|mark_difference|
|19|19|r → ʷ|nhuːrɪˈme|nhuːʷɹəme|mixed_alignment|
|20|20|ɪ → ɹ|huːrɪˈmeɪ|huːʷɹəmeː|base_difference|
|21|21|ˈ → ə|uːrɪˈmeɪn|uːʷɹəmeːn|mixed_alignment|
|24|24|ɪ → ː|ɪˈmeɪndˈs|ɹəmeːn͡ds|mixed_alignment|
|26|26|d → ͡|meɪndˈsɪɾ|meːn͡dsɪɾ|mixed_alignment|
|27|27|ˈ → d|eɪndˈsɪɾɪ|eːn͡dsɪɾɪ|mixed_alignment|

以上差异均待听辨确认；无可信音素时间边界，因此不自动裁切“音素片段”。

