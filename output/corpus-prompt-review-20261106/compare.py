"""Manual live comparison; preserves production prompts and excludes account data."""
import copy
import hashlib
import json
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import httpx

ROOT = Path('/Users/river/Documents/Libitu')
OUT = Path(__file__).parent
sys.path.insert(0, str(ROOT / 'apps/api'))
os.chdir(ROOT / 'apps/api')
from app.config import get_settings
from app.integrations.ark_selection import _selection_user_prompt, _parse_selection_response
from app.integrations.ark_corpus_detail import _request
from app.schemas.corpus import CorpusSelectionAnalysisRequest, CorpusSyntaxRequest, CorpusSelectionSyntaxAnalysis

settings = get_settings()
assert settings.corpus_api_key
sentence = 'The team has pockets of greatness in design, but it still struggles to deliver consistently.'
CASES = [
    ('pockets', 'phrase', 'chunk', 'pockets of greatness', sentence,
     'We need to take an honest look at how the team is performing.',
     'Our next step is to make those strengths part of our everyday process.'),
    ('drifted', 'phrase', 'chunk', 'drifted away from',
     'The team has drifted away from its original mission, but it is working hard to regain its focus.',
     'We started this project to make everyday tasks easier.',
     'Next month we will simplify the product and focus on our core users.'),
    ('team_sentence', 'sentence', 'structure', sentence,
     sentence, 'We need to take an honest look at how the team is performing.',
     'Our next step is to make those strengths part of our everyday process.'),
    ('infinitive_sentence', 'sentence', 'structure',
     'She wants to leave, but he hopes to stay.',
     'She wants to leave, but he hopes to stay.',
     'They have different plans for the weekend.',
     'They need to agree before they book their tickets.'),
]
paths = {
    ('current','explain'): ROOT/'apps/api/app/prompts/corpus_selection_system.txt',
    ('current','syntax'): ROOT/'apps/api/app/prompts/corpus_syntax_system.txt',
    ('proposed','explain'): ROOT/'design/docs/corpus_explain_system.txt',
    ('proposed','syntax'): ROOT/'design/docs/corpus_syntax_system.txt',
}
prompts = {key:path.read_text().strip() for key,path in paths.items()}
(OUT/'prompts').mkdir(exist_ok=True)
for (version,stage), prompt in prompts.items():
    (OUT/'prompts'/f'{version}-{stage}.txt').write_text(prompt)

def probe(case, stage, version, round_number):
    name, selection_type, kind, selected, current, before, after = case
    context = dict(selected_text=selected,current_sentence=current,context_before=before,context_after=after,timestamp='0:38.120')
    system = prompts[version,stage]
    if stage == 'explain':
        user = _selection_user_prompt(CorpusSelectionAnalysisRequest(**context))
        request = dict(model=settings.corpus_model,messages=[dict(role='system',content=system),dict(role='user',content=user)],
                       response_format={'type':'json_object'},thinking={'type':'disabled'},temperature=0.1,
                       max_tokens=min(settings.ark_max_output_tokens,4000),stream=False)
    else:
        request = _request(system,CorpusSyntaxRequest(**context,selection_type=selection_type,kind=kind),stream=False)
    row = dict(case=name,stage=stage,version=version,round=round_number,model=settings.corpus_model,
               prompt_sha256=hashlib.sha256(system.encode()).hexdigest(),request=request)
    start=time.perf_counter()
    try:
        with httpx.Client(base_url=settings.corpus_base_url.rstrip('/'),timeout=100) as client:
            response=client.post('/chat/completions',headers={'Authorization':f'Bearer {settings.corpus_api_key}'},json=request)
        row['seconds']=round(time.perf_counter()-start,3)
        row['status']=response.status_code
        response.raise_for_status()
        packet=response.json()
        row['usage']=packet.get('usage',{})
        choice=packet['choices'][0]
        row['finish_reason']=choice.get('finish_reason')
        row['raw_output']=choice['message']['content']
        row['output']=json.loads(row['raw_output'])
        try:
            if stage == 'explain':
                parsed=_parse_selection_response(copy.deepcopy(packet))
                row['current_app_accepts']=True
                row['current_app_retained']={'teacher_note':parsed.teacher_note,'reusable_patterns':[p.model_dump() for p in parsed.reusable_patterns],
                    'collocations':parsed.collocations,'stress_text':parsed.explanation.pronunciation.stress_text,'pitfalls':parsed.pitfalls}
            else:
                parsed=CorpusSelectionSyntaxAnalysis.model_validate(row['output'])
                row['current_app_accepts']=bool(parsed.sentence_type.strip() and parsed.main_clause.strip())
        except Exception as error:
            row['current_app_accepts']=False
            row['contract_error']=type(error).__name__
    except Exception as error:
        row['seconds']=round(time.perf_counter()-start,3)
        row['error_type']=type(error).__name__
    (OUT/f'{round_number}-{name}-{stage}-{version}.json').write_text(json.dumps(row,ensure_ascii=False,indent=2))
    print(json.dumps({k:row.get(k) for k in ('case','stage','version','round','seconds','status','finish_reason','current_app_accepts','error_type')},ensure_ascii=False),flush=True)
    return row

heldout = '--heldout' in sys.argv
if heldout:
    unseen = 'The new analyst hopes to improve the forecast, but she still struggles to explain her assumptions.'
    CASES = [('heldout_sentence','sentence','structure',unseen,unseen,
              'The report needs clearer reasoning and more accurate estimates.',
              'Her manager will review the draft with her tomorrow.')]
print(json.dumps({'provider':settings.corpus_analysis_provider,'model':settings.corpus_model,'calls':len(CASES)*8,'concurrency':2}),flush=True)
rows=[]
with ThreadPoolExecutor(max_workers=2) as pool:
    for round_number in (1,2):
        futures=[]
        for case in CASES:
            for stage in ('explain','syntax'):
                for version in (('current','proposed') if round_number==1 else ('proposed','current')):
                    futures.append(pool.submit(probe,case,stage,version,round_number))
        for future in as_completed(futures):rows.append(future.result())
(OUT/('heldout-results.json' if heldout else 'results.json')).write_text(json.dumps(rows,ensure_ascii=False,indent=2))
