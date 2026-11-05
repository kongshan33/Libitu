import json
import os
import sys
import time
from pathlib import Path

root = Path(__file__).resolve().parents[2]
os.chdir(root / 'apps/api'); sys.path.insert(0, str(root / 'apps/api'))
from app.integrations import ark_corpus_detail as detail
from app.schemas.corpus import CorpusFollowupRequest
original = detail._request
def with_thinking(*args, **kwargs):
    data = original(*args, **kwargs)
    data.update(thinking={'type':'enabled'}, reasoning_effort='low', max_tokens=4000)
    return data
detail._request = with_thinking
out = root / 'output/corpus-live/followup-low'; out.mkdir(exist_ok=True)
for case in ('phrase', 'sentence'):
    row = json.loads((root / f'output/corpus-live/final-check/{case}-followup.json').read_text())
    row.update(thinking='low', transport='application adapter directly')
    start=time.perf_counter(); first=None; answer=''; events=[]
    print(case, 'starting', flush=True)
    for packet in detail.stream_corpus_followup(CorpusFollowupRequest(**row['input'])):
        lines=packet.splitlines(); event=lines[0][7:]; data=json.loads(lines[1][6:]); events.append(event)
        if event == 'delta':
            if first is None: first=time.perf_counter()-start
            answer+=data['text']
        if event == 'error': row['error']=data
    row.update(output=answer, events=sorted(set(events)), first_delta_seconds=round(first,3) if first else None,total_seconds=round(time.perf_counter()-start,3))
    (out/f'{case}-followup.json').write_text(json.dumps(row,ensure_ascii=False,indent=2))
    print(case,row['total_seconds'],row['first_delta_seconds'],flush=True)
