-- Synthetic records only; verifies the same freezing contract used by hosted RPCs.
begin;
set local role service_role;
do $$
declare
  owner_id text := 'recast-sql-' || gen_random_uuid()::text;
  session_doc jsonb;
  sid uuid;
  runtime_doc jsonb;
  job jsonb;
  frozen jsonb;
  original_hash text;
begin
  assert not has_function_privilege('authenticated', 'public.enqueue_speaking_feedback(text,uuid,boolean)', 'execute');
  assert not has_function_privilege('anon', 'public.enqueue_speaking_feedback(text,uuid,boolean)', 'execute');
  insert into public.profiles(id) values(owner_id);
  session_doc := public.create_speaking_loadout(owner_id,gen_random_uuid(),'workplace',
    'Describe our manufacturing business','standard','balanced',null,array[]::uuid[]);
  sid := (session_doc->>'id')::uuid;
  runtime_doc := jsonb_build_object('runtime',jsonb_build_object('ticket','PRIVATE_TICKET'),
    'messages', jsonb_build_array(jsonb_build_object('id','learner','ordinal',0,'role','user','revision',1,
      'status','final','input_source','text','text','We product high-end chips.','created_at',now()::text)),
    'recasts', jsonb_build_array(jsonb_build_object('id','recast','version',1,'status','ready','validated',true,
      'replacement','We produce high-end chips.','category','word_choice','rule_key','product_as_verb','reason','Use the verb produce.',
      'runtime_id','PRIVATE_RUNTIME','instruction','PRIVATE_PROMPT','prompt_version','PRIVATE_VERSION',
      'source',jsonb_build_object('message_id','learner','revision',1,'start',0,'end',26,'quote','We product high-end chips.','secret','PRIVATE_SOURCE'),
      'delivery',null,
      'edits',jsonb_build_array(jsonb_build_object('start',3,'end',10,'before','product','after','produce','secret','PRIVATE_EDIT')),
      'changed_spans',jsonb_build_array(jsonb_build_object('start',3,'end',10,'quote','produce','secret','PRIVATE_SPAN')))));
  insert into public.speaking_runtime_state(session_id,document,version) values(sid,runtime_doc,1);
  update public.speaking_sessions set status='completed',turn_count=1 where id=sid;
  job := public.enqueue_speaking_feedback(owner_id,sid,false);
  assert job #>> '{source,recasts,0,category}' = 'word_choice';
  assert job #>> '{source,recasts,0,source,quote}' = 'We product high-end chips.';
  assert job #>> '{source,recasts,0,changed_spans,0,quote}' = 'produce';
  assert (job->'source')::text not like '%PRIVATE_%';
  frozen := job->'source'; original_hash := job->>'input_hash';
  update public.speaking_runtime_state set document='{}' where session_id=sid;
  job := public.enqueue_speaking_feedback(owner_id,sid,true);
  assert job->'source' = frozen and job->>'input_hash' = original_hash;
  assert public.read_speaking_feedback(owner_id || '-other',sid) is null;
end;
$$;
rollback;
