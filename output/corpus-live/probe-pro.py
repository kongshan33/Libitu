"""Manual provider comparison through the application adapters, no config writes."""
import json
import os
import sys
import time
from pathlib import Path

root = Path(__file__).resolve().parents[2]
os.chdir(root / 'apps/api')
sys.path.insert(0, str(root / 'apps/api'))
from app.config import get_settings
from app.integrations import ark_corpus_detail as detail, ark_selection
from app.schemas.corpus import CorpusSelectionAnalysisRequest, CorpusSyntaxRequest, CorpusFollowupRequest
from app.services.corpus_selection_service import analyze_corpus_selection

settings = get_settings().model_copy(update={'ark_model':'doubao-seed-2-1-pro-260915'})
ark_selection.get_settings = detail.get_settings = lambda: settings
ark_selection._selection_client.cache_clear()
out = root / 'output/corpus-live/pro'
out.mkdir(exist_ok=True)
for case in ('phrase','sentence'):
    for task in ('explain','syntax','followup'):
        source = json.loads((root / f'output/corpus-live/accepted/{case}-{task}.json').read_text())
        payload = source['input']
        row = dict(case=case, task=task, input=payload, model=settings.ark_model, transport='application adapter directly')
        print(case, task, 'starting', flush=True)
        start = time.perf_counter()
        if task == 'explain': row['output'] = analyze_corpus_selection(CorpusSelectionAnalysisRequest(**payload)).model_dump()
        elif task == 'syntax': row['output'] = detail.generate_corpus_syntax(CorpusSyntaxRequest(**payload)).model_dump()
        else:
            answer = ''; first = None; events = []
            for packet in detail.stream_corpus_followup(CorpusFollowupRequest(**payload)):
                lines = packet.splitlines(); event = lines[0][7:]; data = json.loads(lines[1][6:]); events.append(event)
                if event == 'delta':
                    if first is None: first = time.perf_counter()-start
                    answer += data['text']
                if event == 'error': row['error'] = data
            row.update(output=answer, events=sorted(set(events)), first_delta_seconds=round(first,3) if first else None)
        row['total_seconds'] = round(time.perf_counter()-start, 3)
        (out / f'{case}-{task}.json').write_text(json.dumps(row,ensure_ascii=False,indent=2))
        print({k:v for k,v in row.items() if k not in ('input','output')},flush=True)
