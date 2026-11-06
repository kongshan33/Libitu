"""Held-out normalization and actual SSE follow-up; synthetic contexts only."""
import json, os, sys, time
from pathlib import Path
ROOT=Path('/Users/river/Documents/Libitu'); OUT=Path(__file__).parent
sys.path.insert(0,str(ROOT/'apps/api'));os.chdir(ROOT/'apps/api')
from app.integrations.ark_selection import generate_selection_analysis
from app.services.corpus_selection_service import _normalize_evidenced_analysis
from app.integrations.ark_corpus_detail import generate_corpus_syntax,stream_corpus_followup
from app.schemas.corpus import CorpusSelectionAnalysisRequest,CorpusSyntaxRequest,CorpusFollowupRequest
cases=[('idiom','broke the ice','Her opening joke broke the ice before the discussion began.'),
 ('plural','glimmers of hope','The latest results offer glimmers of hope, but more research is needed.'),
 ('sentence','Her proposal has several advantages, but the reviewers want to test it before approval.','Her proposal has several advantages, but the reviewers want to test it before approval.')]
rows=[]
for name,selected,sentence in cases:
 context=dict(selected_text=selected,current_sentence=sentence)
 start=time.perf_counter(); result=_normalize_evidenced_analysis(CorpusSelectionAnalysisRequest(**context),generate_selection_analysis(CorpusSelectionAnalysisRequest(**context)))
 rows.append(dict(case=name,stage='explain',seconds=round(time.perf_counter()-start,3),output=result.model_dump()))
 start=time.perf_counter(); syntax=generate_corpus_syntax(CorpusSyntaxRequest(**context,selection_type=result.selection_type,kind=result.fields.kind))
 rows.append(dict(case=name,stage='syntax',seconds=round(time.perf_counter()-start,3),output=syntax.model_dump()))
 print(name,'complete',flush=True)
for name,selected,sentence,question in [
 ('phrase','drifted away from','The team has drifted away from its original mission, but it is working hard to regain its focus.','用这个表达写两句职场对话，并简短解释。'),
 ('sentence','The new analyst hopes to improve the forecast, but she still struggles to explain her assumptions.','The new analyst hopes to improve the forecast, but she still struggles to explain her assumptions.','换成更口语的说法，保留原意。')]:
 start=time.perf_counter(); first=None; answer='';done=False;error=False
 for event in stream_corpus_followup(CorpusFollowupRequest(selected_text=selected,current_sentence=sentence,question=question)):
  if event.startswith('event: delta'):
   if first is None:first=time.perf_counter()-start
   answer+=json.loads(event.split('data: ',1)[1])['text']
  done|=event.startswith('event: done');error|=event.startswith('event: error')
 row=dict(case=name,stage='followup',question=question,first_token_seconds=round(first,3) if first else None,seconds=round(time.perf_counter()-start,3),done=done,error=error,answer=answer)
 rows.append(row);print(json.dumps(row,ensure_ascii=False),flush=True)
(OUT/'heldout-and-followup.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
