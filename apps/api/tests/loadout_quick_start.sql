-- Run after loadout_quick_start_targets; synthetic records always roll back.
begin;
set local role service_role;
do $$
declare
  owner_a text := 'quick-start-a-' || gen_random_uuid()::text;
  owner_b text := 'quick-start-b-' || gen_random_uuid()::text;
  free_client uuid := gen_random_uuid();
  planned_client uuid := gen_random_uuid();
  ids uuid[] := array[]::uuid[];
  item_id uuid;
  plan_id uuid := gen_random_uuid();
  candidate_id uuid := gen_random_uuid();
  targets jsonb := '[]'::jsonb;
  snapshots jsonb;
  candidate jsonb;
  plan jsonb;
  free_session jsonb;
  planned_session jsonb;
  i integer;
begin
  assert not has_function_privilege('anon', 'public.save_speaking_plan(text,jsonb,jsonb)', 'execute');
  assert not has_function_privilege('authenticated', 'public.create_speaking_loadout(text,uuid,text,text,text,text,jsonb,uuid[])', 'execute');
  assert not (select prosecdef from pg_proc where oid =
    'public.create_speaking_loadout(text,uuid,text,text,text,text,jsonb,uuid[])'::regprocedure);

  -- Empty corpus is a real owner-scoped conversation, including exact recovery.
  free_session := public.create_evidence_speaking_loadout(owner_a,free_client,'everyday',
    'Have a relaxed conversation','standard','balanced',null,array[]::uuid[],'model_frame','speaking-evidence-v3');
  assert free_session->'items' = '[]'::jsonb;
  assert free_session->'logic_template' = 'null'::jsonb;
  assert free_session->'mission_plan' = 'null'::jsonb;
  assert public.create_evidence_speaking_loadout(owner_a,free_client,'everyday',
    'Have a relaxed conversation','standard','balanced',null,array[]::uuid[],'model_frame','speaking-evidence-v3') = free_session;
  assert public.get_speaking_loadout(owner_b,(free_session->>'id')::uuid) is null;
  begin
    perform public.create_evidence_speaking_loadout(owner_a,free_client,'everyday',
      'Changed goal','standard','balanced',null,array[]::uuid[],'model_frame','speaking-evidence-v3');
    raise exception 'Expected exact free request conflict';
  exception when sqlstate 'PT409' then null; end;

  -- All five targets may be structures and have equal priority.
  for i in 1..5 loop
    item_id := gen_random_uuid();
    insert into public.corpus_items(id,user_id,kind,text,slots,tags)
      values(item_id,owner_a,'structure','Given [premise], we should [action] ' || i,
        '{"premise":"a fact","action":"a plan"}',array['proposing']);
    ids := array_append(ids,item_id);
    targets := targets || jsonb_build_array(jsonb_build_object('corpus_item_id',item_id,
      'role','primary','communicative_function','Propose an action','fit','high',
      'fit_reason','The colleagues need a plan.','trigger_question','What would you suggest?',
      'skip_when','An action is already agreed.','metadata_status','unknown'));
  end loop;
  select jsonb_agg(public.speaking_corpus_snapshot(c) order by requested.ordinal) into snapshots
    from unnest(ids) with ordinality requested(id,ordinal)
    join public.corpus_items c on c.id=requested.id;
  candidate := jsonb_build_object('id',candidate_id,'title','Make a plan','setting','Discuss next steps.',
    'goal','Agree on next steps','user_role','Colleague','ai_role','Team lead','register','neutral','targets',targets);
  plan := jsonb_build_object('id',plan_id,'version',1,'scenario_type','workplace',
    'brief','Make a plan','created_at',now(),'candidates',jsonb_build_array(candidate));
  assert public.save_speaking_plan(owner_a,plan,snapshots) = plan;
  planned_session := public.create_evidence_speaking_loadout(owner_a,planned_client,'workplace',
    'Agree on next steps','standard','balanced',null,ids,'model_frame','speaking-evidence-v3',plan_id,candidate_id);
  assert jsonb_array_length(planned_session->'items') = 5;
  assert (select count(*) from jsonb_array_elements(planned_session->'mission_plan'->'targets') t
    where t->>'role'='primary') = 5;
  assert public.create_evidence_speaking_loadout(owner_a,planned_client,'workplace',
    'Agree on next steps','standard','balanced',null,ids,'model_frame','speaking-evidence-v3',plan_id,candidate_id) = planned_session;
  begin
    perform public.save_speaking_plan(owner_a,plan || jsonb_build_object('id',gen_random_uuid()),
      snapshots || jsonb_build_array(snapshots->0));
    raise exception 'Expected six-target rejection';
  exception when sqlstate 'PT422' then null; end;
end;
$$;
rollback;
