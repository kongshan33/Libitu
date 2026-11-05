"""Explicit manual paid-provider probe; never collected by automated tests."""
import json
import hashlib
from datetime import datetime, timezone
import os
import sys
import time
from pathlib import Path
import httpx
root = next(p for p in Path(__file__).resolve().parents if (p / 'CLAUDE.MD').exists())
sys.path.insert(0, str(root / 'apps/api'))
os.chdir(root / "apps/api")
from app.config import get_settings
round_name = sys.argv[1] if len(sys.argv) > 1 else datetime.now(timezone.utc).strftime('probe-%Y%m%dT%H%M%SZ')
out = root / 'output/corpus-live' / round_name
out.mkdir(parents=True, exist_ok=True)
settings = get_settings()
print(json.dumps({'provider': settings.corpus_analysis_provider, 'model': settings.corpus_model, 'configured': bool(settings.corpus_api_key), 'round': round_name}), flush=True)
sentence = 'The team has pockets of greatness in design, but it still struggles to deliver consistently.'
base = {'current_sentence': sentence, 'context_before': 'We need to take an honest look at how the team is performing.', 'context_after': 'Our next step is to make those strengths part of our everyday process.', 'timestamp': '0:38.120'}
cases = [('phrase', 'pockets of greatness', '和 islands of excellence 相比，语气有什么不同？给我一段两句的职场对话。'),('sentence', sentence, '把这句话换成更自然的日常口语，保留先肯定再指出问题的语气，并说明改动。')]
results = []
with httpx.Client(base_url='http://127.0.0.1:8000',timeout=100) as client:
 for name, selected, question in cases:
  context = {**base, 'selected_text':selected}; analysis = None
  for task, path, payload in [('explain','analyze-selection',context), ('syntax','analyze-syntax',None), ('followup','ask',{**context, 'question':question,'history':[]})]:
   if task == 'syntax':
    if not analysis or analysis.get('analysis_source') != 'ai':
     print('Skipping syntax after failed explanation', flush=True);continue
    payload={**context,'selection_type':analysis['selection_type'],'kind':analysis['fields']['kind']}
   start=time.perf_counter();first=None
   print(f'{name}/{task} starting',flush=True)
   prompt_name = {'explain':'corpus_selection_system.txt','syntax':'corpus_syntax_system.txt','followup':'corpus_followup_system.txt'}[task]
   row={'case':name,'task':task,'input':payload,'provider':settings.corpus_analysis_provider,'model':settings.corpus_model,'started_at':datetime.now(timezone.utc).isoformat(),'prompt_sha256':hashlib.sha256((root/'apps/api/app/prompts'/prompt_name).read_bytes()).hexdigest()}
   try:
    if task != 'followup':
     response=client.post('/api/corpus/'+path,json=payload)
     row.update(status=response.status_code,output=response.json())
     if task=='explain':analysis=row['output']
    else:
     events=[];answer=''
     with client.stream('POST','/api/corpus/'+path,json=payload) as response:
      row['status']=response.status_code; event=''
      for line in response.iter_lines():
       if line.startswith('event:'):event=line[6:].strip()
       elif line.startswith('data:'):
        data=json.loads(line[5:]);events.append(event)
        if event=='delta' and data.get('text'):
         if first is None:first=time.perf_counter()-start
         answer+=data['text']
        if event=='error':row['error']=data
     row.update(output=answer,events=sorted(set(events)),first_delta_seconds=round(first,3) if first else None)
   except Exception as error:row['error']=type(error).__name__
   row['total_seconds']=round(time.perf_counter()-start,3)
   (out/f'{name}-{task}.json').write_text(json.dumps(row,ensure_ascii=False,indent=2))
   results.append(row)
   print(json.dumps({k:v for k,v in row.items() if k not in ('input','output','events')},ensure_ascii=False),flush=True)
(out/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
