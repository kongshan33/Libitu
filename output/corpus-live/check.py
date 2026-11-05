"""Offline contract checks for the authored live fixture, not a semantic grader."""
import json
import re
import sys
from pathlib import Path

folder = Path(__file__).parent / sys.argv[1]
checks = []

def check(case, rule, passed):
    checks.append({'case': case, 'rule': rule, 'passed': bool(passed)})

for case in ('phrase', 'sentence'):
    rows = {task: json.loads((folder / f'{case}-{task}.json').read_text()) for task in ('explain', 'syntax', 'followup')}
    check(case, 'all endpoints return HTTP 200', all(r['status'] == 200 for r in rows.values()))
    explain = rows['explain']['output']; syntax = rows['syntax']['output']; followup = rows['followup']
    check(case, 'real AI, no eager syntax', explain['analysis_source'] == 'ai' and explain['syntax_state'] == 'pending' and not explain['syntax_analysis']['main_clause'])
    check(case, 'teacher note has 60–120 characters', 60 <= len(explain['teacher_note']) <= 120)
    check(case, 'one or two examples with exactly one typical', 1 <= len(explain['explanation']['examples']) <= 2 and sum(x['typical'] for x in explain['explanation']['examples']) == 1)
    check(case, 'framework slot keys match template', all(set(re.findall(r'\[([^\]]+)\]', p['template'])) == set(p['slots']) for p in explain['reusable_patterns']))
    check(case, 'scenarios are not repeated in syntax', syntax['usage_scenarios'] == [])
    check(case, 'source evidence equals supplied context', syntax['evidence'] == [rows['syntax']['input'][k] for k in ('context_before','current_sentence','context_after')])
    check(case, 'follow-up has actual delta and explicit done, no error', set(followup['events']) == {'delta','done'} and 'error' not in followup and followup['first_delta_seconds'] > 0)
    check(case, 'follow-up limited Markdown', not any(x in followup['output'] for x in ('```','<script','<img','http://','https://')))
    if case == 'phrase':
        check(case, 'fixture collocations retain target expression', 2 <= len(explain['collocations']) <= 3 and all('pockets of greatness' in x.lower() for x in explain['collocations']))
        check(case, 'phrase has only three syntax modules', all(not syntax[k] for k in ('grammar_points','information_hierarchy','style_features','wording_notes','translations','translation_notes','reusable_patterns')))
        turns = re.findall(r'^([AB]):\s*(.+)$', followup['output'], re.M)
        check(case, 'two English dialog turns, one sentence each', len(turns) == 2 and all(len(re.findall(r'[.!?]', t)) == 1 for _,t in turns))
    else:
        check(case, 'full sentence includes both translations', len(syntax['translations']) == 2 and sum(x['recommended'] for x in syntax['translations']) == 1)

(folder / 'checks.json').write_text(json.dumps(checks, ensure_ascii=False, indent=2))
for item in checks:
    if not item['passed']: print('FAIL', item)
print(f"{sum(c['passed'] for c in checks)}/{len(checks)} offline contract checks passed; teaching content requires manual review")
sys.exit(any(not c['passed'] for c in checks))
