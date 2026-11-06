"""Replay captured real outputs through final validation, without provider calls."""
import json,os,sys,time,statistics,copy,re
from pathlib import Path
ROOT=Path('/Users/river/Documents/Libitu'); OUT=Path(__file__).parent
sys.path.insert(0,str(ROOT/'apps/api'));os.chdir(ROOT/'apps/api')
import httpx
from app.integrations.ark_selection import _parse_selection_response
from app.integrations import ark_corpus_detail as detail
from app.services.corpus_selection_service import _normalize_evidenced_analysis
from app.schemas.corpus import CorpusSelectionAnalysisRequest,CorpusSyntaxRequest
rows=json.loads((OUT/'release/results.json').read_text()); served=[]
for row in rows:
 if row['version']!='after':continue
 raw=row['raw_output'];packet={'choices':[{'finish_reason':row['finish_reason'],'message':{'content':raw}}]}
 request=row['request'];user=request['messages'][1]['content'];context=json.loads(user[user.index('{'):])
 start=time.perf_counter()
 if row['stage']=='explain':
  result=_normalize_evidenced_analysis(CorpusSelectionAnalysisRequest(**context),_parse_selection_response(packet))
 else:
  with httpx.Client(base_url='https://fixture.invalid',transport=httpx.MockTransport(lambda req:httpx.Response(200,json=packet))) as client:
   previous=detail._selection_client;detail._selection_client=lambda:client
   try:result=detail.generate_corpus_syntax(CorpusSyntaxRequest(**context))
   finally:detail._selection_client=previous
 served.append({'case':row['case'],'round':row['round'],'stage':row['stage'],'provider_seconds':row['seconds'],'normalization_ms':round((time.perf_counter()-start)*1000,3),'json_recovered':row.get('error_type')=='JSONDecodeError','output':result.model_dump(by_alias=True)})
(OUT/'release/app-results.json').write_text(json.dumps(served,ensure_ascii=False,indent=2))
metrics=[]
for stage in ('explain','syntax'):
 for version in ('before','after'):
  subset=[r for r in rows if r['stage']==stage and r['version']==version]
  metrics.append({'stage':stage,'version':version,'n':len(subset),'http_200':sum(r['status']==200 for r in subset),'strict_json':sum('output' in r for r in subset),'mean_seconds':round(statistics.mean(r['seconds'] for r in subset),3),'median_seconds':round(statistics.median(r['seconds'] for r in subset),3),'mean_completion_tokens':statistics.mean(r['usage']['completion_tokens'] for r in subset),'min_seconds':min(r['seconds'] for r in subset),'max_seconds':max(r['seconds'] for r in subset)})
(OUT/'release/metrics.json').write_text(json.dumps(metrics,ensure_ascii=False,indent=2))
print(json.dumps(metrics,ensure_ascii=False,indent=2))
print('Final validator accepted',len(served),'captured after responses; recovered',sum(r['json_recovered'] for r in served))
for r in served:
 if r['stage']=='explain':
  o=r['output'];pat=o['reusable_patterns'];slots_ok=all(set(re.findall(r'\[([^]]+)\]',p['template']))==set(p['slots']) for p in pat)
  print(r['case'],r['round'],'learning=',o['learning_text'],'IPA=',o['explanation']['pronunciation']['ipa'],'slots_match=',slots_ok,'suggestions=',len(o['ask_suggestions']),'similar=',len(o['explanation']['similar_expressions']))
