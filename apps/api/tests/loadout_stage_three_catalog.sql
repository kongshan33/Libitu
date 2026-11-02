-- Stage 3 Travel/daily catalog persistence, owner boundary and exact retry.
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
  logic jsonb := '{"id":"making_plans","title":"Making plans","description":"Plan a trip","steps":["Suggest","Check","Adjust","Confirm"]}';
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
  plan := jsonb_build_object('id',plan_id,'version',2,'scenario_type','travel',
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
    perform public.create_evidence_speaking_loadout(owner_a,client_id,'travel',
      'Agree on next steps','standard','balanced',logic || '{"id":"status_update"}',ids,
      'model_frame','speaking-evidence-v3',plan_id,candidate_id);
    raise exception 'Expected changed logic rejection';
  exception when sqlstate 'PT409' then null; end;
  -- Freeze the stored template, not a subsequently changed caller snapshot.
  session := public.create_evidence_speaking_loadout(owner_a,client_id,'travel',
    'Agree on next steps','standard','balanced',logic || '{"steps":["Changed"]}',ids,
    'model_frame','speaking-evidence-v3',plan_id,candidate_id);
  assert session->'logic_template'=logic;
  assert session->'mission_plan'->'logic_template'=logic;
  assert session->'mission_plan'->>'version'='2';
  assert jsonb_array_length(session->'mission_plan'->'targets')=5;
  assert session->'mission_plan'->'targets'->4->'stage_index'='null'::jsonb;
  assert session->'mission_plan'->'targets'->0->>'model_line'=targets->0->>'model_line';
  assert public.create_evidence_speaking_loadout(owner_a,client_id,'travel',
    'Agree on next steps','standard','balanced',logic,ids,
    'model_frame','speaking-evidence-v3',plan_id,candidate_id)=session;
  assert session->>'scenario_type' = 'travel';
  foreach invalid in array array[
    '{"id":"telling_story","title":"Telling a story","description":"Share an experience","steps":["Setting","Complication","Outcome","Reflection"]}'::jsonb,
    '{"id":"catching_up","title":"Catching up","description":"Keep a friendly chat going","steps":["Open","Share","Relate","Follow up"]}'::jsonb
  ] loop
    linked_session := public.create_speaking_loadout(owner_a, gen_random_uuid(), 'travel',
      'Talk about a trip', 'guided', 'detailed', invalid, ids);
    assert linked_session->'logic_template' = invalid;
  end loop;
  linked_session := public.create_speaking_loadout(owner_a, gen_random_uuid(), 'travel',
    'Talk about a trip', 'guided', 'detailed', null, array[]::uuid[]);
  assert linked_session->'logic_template' = 'null'::jsonb;
end;
$$;
rollback;
