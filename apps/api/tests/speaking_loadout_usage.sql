-- Stage 3 source projection: no assessment enqueue or writes, all rows roll back.
begin;
set local role service_role;
do $$
declare
  owner_id text := 'loadout-usage-sql-' || gen_random_uuid()::text;
  foreign_owner text := 'loadout-usage-other-' || gen_random_uuid()::text;
  corpus_id uuid := gen_random_uuid();
  fresh_corpus uuid := gen_random_uuid();
  foreign_corpus uuid := gen_random_uuid();
  sid uuid;
  iid uuid;
  source jsonb;
  result jsonb;
  projection jsonb;
  recent_report jsonb;
  before_jobs bigint;
  before_sessions bigint;
begin
  assert not has_function_privilege('anon',
    'public.read_speaking_loadout_usage(text,uuid[],integer)','execute');
  assert not has_function_privilege('authenticated',
    'public.read_speaking_loadout_usage(text,uuid[],integer)','execute');
  assert not (select prosecdef from pg_proc where oid =
    'public.read_speaking_loadout_usage(text,uuid[],integer)'::regprocedure);
  assert (select provolatile='s' from pg_proc where oid =
    'public.read_speaking_loadout_usage(text,uuid[],integer)'::regprocedure);
  insert into public.profiles(id) values(owner_id),(foreign_owner);
  insert into public.corpus_items(id,user_id,kind,text) values
    (corpus_id,owner_id,'chunk','to be fair'),(fresh_corpus,owner_id,'chunk','fresh language'),
    (foreign_corpus,foreign_owner,'chunk','other owner language');
  for n in 1..103 loop
    sid := gen_random_uuid(); iid := gen_random_uuid();
    insert into public.speaking_sessions(id,user_id,client_id,scenario_type,goal,status,request_payload,turn_count,created_at)
      values(sid,case when n=103 then foreign_owner else owner_id end,
        case when n=102 then null else gen_random_uuid() end,'workplace','Agree on a date',
        case when n=101 then 'active' else 'completed' end,
        case when n=102 then null else '{}'::jsonb end,1,
        '2026-10-20T00:00:00Z'::timestamptz + n * interval '1 second');
    insert into public.speaking_session_items(id,session_id,corpus_item_id,source_corpus_item_id,ordinal,kind,text_snapshot)
      values(iid,sid,corpus_id,case when n=102 then null else corpus_id end,0,'chunk','to be fair');
    if n>=101 then continue; end if; -- keep active and legacy records without reports
    source := jsonb_build_object(
      'session',jsonb_build_object('id',sid,'user_id',owner_id,'evidence_contract_version','speaking-evidence-v3',
        'items',jsonb_build_array(
          jsonb_build_object('id',iid,'source_corpus_item_id',corpus_id,'kind','chunk',
            'text','to be fair','meaning',null,'slots','{}'::jsonb),
          jsonb_build_object('id',gen_random_uuid(),'source_corpus_item_id',fresh_corpus,'text','unrelated private language')),
        'mission_plan',jsonb_build_object('setting','A meeting','goal','Agree','user_role','Lead','ai_role','Colleague',
          'private','must not leak','targets',jsonb_build_array(jsonb_build_object('session_item_id',iid,'role','primary')))),
      'messages',jsonb_build_array(
        jsonb_build_object('id','user','role','user','status','final','revision',1,
          'text','to be fair, testing takes time.','finalized_at','2026-10-19T10:00:00Z','private','must not leak'),
        jsonb_build_object('id','user','role','user','status','final','revision',2,
          'text','Changed final transcript.','finalized_at','2026-10-19T10:01:00Z'),
        jsonb_build_object('id','unrelated','role','assistant','text','unrelated private words')),
      'evidence','[]'::jsonb,'controller',jsonb_build_object('exposures','[]'::jsonb));
    result := jsonb_build_object('item_results',jsonb_build_array(jsonb_build_object(
      'session_item_id',iid,'role','primary','status','appropriate','opportunity_status','used',
      'independent_uses',0,'prompted_uses',1,'imitation_uses',1,'uncertain_assistance_uses',0,
      'private','must not leak','qualifying_independent_evidence','[]'::jsonb,
      'evidence',jsonb_build_array(jsonb_build_object('message_id','user','transcript_revision',1,
        'quote','to be fair','start',0,'end',10)))));
    insert into public.speaking_feedback(session_id,status,source,result,input_hash,rubric_version,analysis_version)
      values(sid,'ready',source,result,repeat('a',64),'speaking-rubric-v2','speaking-feedback-v3');
  end loop;
  select count(*) into before_jobs from public.speaking_feedback;
  select count(*) into before_sessions from public.speaking_sessions;
  projection := public.read_speaking_loadout_usage(owner_id,array[fresh_corpus,corpus_id]);
  assert jsonb_array_length(projection->'items')=2;
  assert projection->'items'->0->>'corpus_item_id'=fresh_corpus::text;
  assert projection->'items'->0->'has_more'='false'::jsonb;
  assert projection->'items'->0->'missions'='[]'::jsonb;
  assert projection->'items'->1->>'corpus_item_id'=corpus_id::text;
  assert projection->'items'->1->'has_more'='true'::jsonb;
  assert jsonb_array_length(projection->'items'->1->'missions')=100;
  assert projection->'items'->1->'missions'->0->'report'='null'::jsonb; -- legacy cannot disappear
  assert projection->'items'->1->'missions'->1->>'session_status'='active';
  assert projection->'items'->1->'missions'->1->'report'='null'::jsonb; -- cannot enqueue assessment
  recent_report := projection->'items'->1->'missions'->2->'report';
  assert jsonb_array_length(recent_report->'items')=1;
  assert recent_report->'items'->0->'result'->'prompted_uses'='1'::jsonb;
  assert recent_report->'items'->0->'result'->'imitation_uses'='1'::jsonb;
  assert jsonb_array_length(recent_report->'items'->0->'messages')=2; -- both revisions retained
  assert recent_report->'items'->0->'messages'->1->'revision'='2'::jsonb;
  assert recent_report->'items'->0->'messages'->0->>'finalized_at'='2026-10-19T10:00:00Z';
  assert recent_report->'items'->0->'skipped'='false'::jsonb;
  assert projection::text not like '%private%' and projection::text not like '%unrelated%';
  assert (select count(*) from public.speaking_feedback)=before_jobs;
  assert (select count(*) from public.speaking_sessions)=before_sessions;
  assert jsonb_array_length(public.read_speaking_loadout_usage(owner_id,array[corpus_id],1)->'items'->0->'missions')=1;
  begin
    perform public.read_speaking_loadout_usage(owner_id,array[foreign_corpus]);
    raise exception 'Expected owner fence';
  exception when sqlstate 'PT404' then null; end;
  begin
    perform public.read_speaking_loadout_usage(foreign_owner,array[corpus_id]);
    raise exception 'Expected owner fence';
  exception when sqlstate 'PT404' then null; end;
  begin
    perform public.read_speaking_loadout_usage(owner_id,array[corpus_id,corpus_id]);
    raise exception 'Expected duplicate rejection';
  exception when sqlstate 'PT422' then null; end;
  begin
    perform public.read_speaking_loadout_usage(owner_id,array[]::uuid[]);
    raise exception 'Expected empty SQL selection rejection';
  exception when sqlstate 'PT422' then null; end;
  begin
    perform public.read_speaking_loadout_usage(owner_id,array[corpus_id],101);
    raise exception 'Expected history cap rejection';
  exception when sqlstate 'PT422' then null; end;
end;
$$;
rollback;
