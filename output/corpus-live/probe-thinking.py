"""Manual two-call comparison; no application configuration changes."""
import json
import os
import sys
import time
from pathlib import Path
import httpx

root = Path(__file__).resolve().parents[2]
os.chdir(root / 'apps/api')
sys.path.insert(0, str(root / 'apps/api'))
from app.config import get_settings
from app.integrations.ark_corpus_detail import SYNTAX_PROMPT, FOLLOWUP_PROMPT

settings = get_settings()
effort = sys.argv[1] if len(sys.argv) > 1 else 'minimal'
out = root / 'output/corpus-live' / f'thinking-{effort}'
out.mkdir(exist_ok=True)
with httpx.Client(base_url=settings.ark_base_url, timeout=90) as client:
    for case, task, prompt in [('sentence', 'syntax', SYNTAX_PROMPT), ('phrase', 'followup', FOLLOWUP_PROMPT)]:
        payload = json.loads((root / f'output/corpus-live/final/{case}-{task}.json').read_text())['input']
        data = dict(model=settings.ark_model, messages=[{'role': 'system', 'content': prompt}, {'role': 'user', 'content': json.dumps(payload, ensure_ascii=False)}], thinking={'type': 'enabled'}, reasoning_effort=effort, max_tokens=4000, stream=task=='followup')
        if task == 'syntax': data['response_format'] = {'type': 'json_object'}
        start = time.perf_counter()
        row = dict(case=case, task=task, model=settings.ark_model, thinking=effort, input=payload)
        print(case, task, 'starting', flush=True)
        if task == 'syntax':
            response = client.post('/chat/completions', headers={'Authorization': f'Bearer {settings.ark_api_key}'}, json=data)
            response.raise_for_status()
            result = response.json()
            row.update(output=result['choices'][0]['message']['content'], finish_reason=result['choices'][0]['finish_reason'], usage=result.get('usage'), status=response.status_code)
        else:
            answer = ''; first = None
            with client.stream('POST', '/chat/completions', headers={'Authorization': f'Bearer {settings.ark_api_key}'}, json=data) as response:
                response.raise_for_status(); row['status'] = response.status_code
                for line in response.iter_lines():
                    if not line.startswith('data:') or line[5:].strip() == '[DONE]': continue
                    packet = json.loads(line[5:]); choices = packet.get('choices', [])
                    if not choices: continue
                    delta = choices[0].get('delta', {}).get('content') or ''
                    if delta and first is None: first = time.perf_counter() - start
                    answer += delta
                    if choices[0].get('finish_reason'): row['finish_reason'] = choices[0]['finish_reason']
            row.update(output=answer, first_delta_seconds=round(first, 3) if first else None)
        row['total_seconds'] = round(time.perf_counter()-start, 3)
        (out / f'{case}-{task}.json').write_text(json.dumps(row, ensure_ascii=False, indent=2))
        print({k:v for k,v in row.items() if k not in ('input','output')}, flush=True)
