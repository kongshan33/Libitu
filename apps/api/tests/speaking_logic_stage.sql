-- Version 2 planning/creation contract; all synthetic data rolls back.
begin;
set local role service_role;
do $$
declare
  owner_a text := 'logic-stage-' || gen_random_uuid()::text;
  owner_b text := 'logic-stage-other-' || gen_random_uuid()::text;
  ids uuid[] := array[]::uuid[];
  item_id uuid;
  client_id uuid := gen_random_uuid();
  plan_id uuid := gen_random_uuid();
  candidate_id uuid := gen_random_uuid();
  targets jsonb := '[]'::jsonb;
  snapshots jsonb;
  candidate jsonb;
  plan jsonb;
  invalid jsonb;
  session jsonb;
  linked jsonb;
  linked_session jsonb;
  linked_candidate_id uuid := gen_random_uuid();
  frozen jsonb;
  attempt jsonb;
  logic jsonb := '{"id":"persuasive_pitch","title":"Persuasive pitch","description":"Make a case","steps":["Context","Tension","Proposal","Defend"]}';
  i integer;
begin
  assert not has_function_privilege('authenticated','public.save_speaking_plan(text,jsonb,jsonb)','execute');
  assert not has_function_privilege('anon','public.create_planned_speaking_loadout(text,uuid,text,text,text,text,jsonb,uuid[],uuid,uuid)','execute');
  insert into public.profiles(id) values(owner_a);
  for i in 1..5 loop
    item_id := gen_random_uuid();
    insert into public.corpus_items(id,user_id,kind,text,tags)
      values(item_id,owner_a,'chunk','to be fair ' || i,array['conceding']);
    ids := array_append(ids,item_id);
    targets := targets || jsonb_build_array(jsonb_build_object('corpus_item_id',item_id,
      'role','primary','communicative_function','Acknowledge a concern','fit','high',
      'fit_reason','The colleagues discuss a concern.','trigger_question','What is your view?',
      'skip_when','The discussion is over.','metadata_status','unknown',
      'sentence_frame','To be fair ' || i || ', [point].',
      'stage_index',case when i=5 then null else (i-1)/2 end,
      'model_line','To be fair ' || i || ', this approach will take some time.'));
  end loop;
  select jsonb_agg(public.speaking_corpus_snapshot(c) order by requested.ordinal) into snapshots
    from unnest(ids) with ordinality requested(id,ordinal)
    join public.corpus_items c on c.id=requested.id;
  candidate := jsonb_build_object('id',candidate_id,'title','Agree on a plan','setting','Discuss a team proposal.',
    'goal','Agree on next steps','user_role','Colleague','ai_role','Team lead','register','neutral','targets',targets);
  plan := jsonb_build_object('id',plan_id,'version',2,'scenario_type','workplace',
    'brief','Make a plan','logic_template',logic,'created_at',now(),'candidates',jsonb_build_array(candidate));
  assert public.save_speaking_plan(owner_a,plan,snapshots)=plan;
  assert public.get_speaking_plan(owner_b,plan_id) is null;
  begin
    perform public.save_speaking_plan(owner_b,plan || jsonb_build_object('id',gen_random_uuid()),snapshots);
    raise exception 'Expected owner rejection';
  exception when sqlstate 'PT404' then null; end;
  -- Reject null, negative, fractional, out-of-range, and absent stage values.
  foreach invalid in array array[
    jsonb_set(plan,'{logic_template}','null'),
    plan #- '{logic_template,description}',
    jsonb_set(plan,'{logic_template,steps,0}',to_jsonb(repeat('x',501))),
    jsonb_set(plan,'{candidates,0,targets,0,stage_index}','-1'),
    jsonb_set(plan,'{candidates,0,targets,0,stage_index}','0.5'),
    jsonb_set(plan,'{candidates,0,targets,0,stage_index}','4'),
    plan #- '{candidates,0,targets,0,stage_index}',
    jsonb_set(plan,'{candidates,0,targets,0,model_line}','""')
  ] loop
    begin
      perform public.save_speaking_plan(owner_a,invalid || jsonb_build_object('id',gen_random_uuid()),snapshots);
      raise exception 'Expected v2 contract rejection';
    exception when sqlstate 'PT422' then null; end;
  end loop;
  begin
    perform public.create_evidence_speaking_loadout(owner_a,client_id,'workplace',
      'Agree on next steps','standard','balanced',logic || '{"id":"status_update"}',ids,
      'model_frame','speaking-evidence-v3',plan_id,candidate_id);
    raise exception 'Expected changed logic rejection';
  exception when sqlstate 'PT409' then null; end;
  -- Freeze the stored template, not a subsequently changed caller snapshot.
  session := public.create_evidence_speaking_loadout(owner_a,client_id,'workplace',
    'Agree on next steps','standard','balanced',logic || '{"steps":["Changed"]}',ids,
    'model_frame','speaking-evidence-v3',plan_id,candidate_id);
  assert session->'logic_template'=logic;
  assert session->'mission_plan'->'logic_template'=logic;
  assert session->'mission_plan'->>'version'='2';
  assert jsonb_array_length(session->'mission_plan'->'targets')=5;
  assert session->'mission_plan'->'targets'->4->'stage_index'='null'::jsonb;
  assert session->'mission_plan'->'targets'->0->>'model_line'=targets->0->>'model_line';
  assert public.create_evidence_speaking_loadout(owner_a,client_id,'workplace',
    'Agree on next steps','standard','balanced',logic,ids,
    'model_frame','speaking-evidence-v3',plan_id,candidate_id)=session;
  update public.speaking_sessions set status='completed' where id=(session->>'id')::uuid;
  linked := plan || jsonb_build_object('id',gen_random_uuid(),
    'practice_source',jsonb_build_object('parent_session_id',session->'id',
      'root_session_id',session->'id','parent_snapshot_hash',repeat('a',64),'variation','details'),
    'candidates',jsonb_build_array(candidate || jsonb_build_object('id',linked_candidate_id,
      'setting','Discuss a new launch plan.', 'changes',jsonb_build_array(jsonb_build_object(
        'field','setting','before',candidate->'setting','after','Discuss a new launch plan.')))));
  assert public.save_practice_speaking_plan(owner_a,linked,snapshots)=linked;
  foreach invalid in array array[
    jsonb_set(linked,'{version}','1'),
    jsonb_set(linked,'{logic_template,steps,0}','"Changed stage"'),
    jsonb_set(linked,'{candidates,0,targets,0,stage_index}','1')
  ] loop
    begin
      perform public.save_practice_speaking_plan(owner_a,invalid || jsonb_build_object('id',gen_random_uuid()),snapshots);
      raise exception 'Expected linked logic rejection';
    exception when sqlstate 'PT425' then null; end;
  end loop;
  linked_session := public.create_evidence_speaking_loadout(owner_a,gen_random_uuid(),'workplace',
    'Agree on next steps','standard','balanced',logic,ids,'model_frame','speaking-evidence-v3',
    (linked->>'id')::uuid,linked_candidate_id);
  assert linked_session->'mission_plan'->>'version'='2';
  assert linked_session->'mission_plan'->'logic_template'=logic;
  assert linked_session->'mission_plan'->'targets'->0->'parent_session_item_id'
    = session->'mission_plan'->'targets'->0->'session_item_id';
  assert linked_session->'mission_plan'->'targets'->4->'stage_index'='null'::jsonb;
  attempt := jsonb_build_object('id',gen_random_uuid(),'response_id','model-response','presented',true,
    'assessment_message_id','assistant-message','assessment_revision',2,
    'presented_message_id','assistant-message','presented_revision',2,
    'policy',jsonb_build_object('action','model_then_transfer','target_item_id',
      session->'mission_plan'->'targets'->0->'session_item_id','instruction','private instruction'),
    'assessment',jsonb_build_object('outcome','reflected','model_quote','A model sentence.',
      'transfer_question_quote','What would you do?'));
  insert into public.speaking_runtime_state(session_id,version,document)
    values((session->>'id')::uuid,1,jsonb_build_object('teaching_attempts',jsonb_build_array(attempt)));
  perform public.enqueue_speaking_feedback(owner_a,(session->>'id')::uuid);
  select source into frozen from public.speaking_feedback where session_id=(session->>'id')::uuid;
  assert frozen->'teaching_attempts'->0->>'assessment_message_id'='assistant-message';
  assert frozen->'teaching_attempts'->0->>'presented_revision'='2';
  assert not ((frozen->'teaching_attempts'->0->'policy') ? 'instruction');
  -- Deleting the plan/source cannot prevent an already-committed exact retry.
  delete from public.speaking_plans where id=plan_id and user_id=owner_a;
  delete from public.corpus_items where id=any(ids) and user_id=owner_a;
  assert (public.create_evidence_speaking_loadout(owner_a,client_id,'workplace',
    'Agree on next steps','standard','balanced',logic,ids,
    'model_frame','speaking-evidence-v3',plan_id,candidate_id)->>'id')=session->>'id';
end;
$$;
rollback;
