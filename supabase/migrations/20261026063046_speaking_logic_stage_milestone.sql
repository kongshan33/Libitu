-- Freeze version 2 logic/stage/model lines without rewriting v1 plans or retries.
-- RPCs retain service-only access, source snapshot validation and owner locks.

create or replace function public.save_speaking_plan(p_user_id text, p_plan jsonb, p_corpus_snapshots jsonb)
returns jsonb language plpgsql security invoker set search_path = ''
as $$
declare
  v_ids uuid[];
  v_current jsonb;
  v_existing public.speaking_plans%rowtype;
  v_candidate jsonb;
  v_count integer;
begin
  if p_user_id is null or length(btrim(p_user_id)) = 0
    or jsonb_typeof(p_plan) is distinct from 'object'
    or coalesce(p_plan->>'version', '') not in ('1', '2')
    or coalesce(p_plan->>'scenario_type', '') not in ('workplace', 'everyday')
    or jsonb_typeof(p_plan->'candidates') is distinct from 'array'
    or jsonb_typeof(p_corpus_snapshots) is distinct from 'array'
  then raise sqlstate 'PT422' using message = 'Invalid speaking plan.'; end if;
  if jsonb_array_length(p_plan->'candidates') not between 1 and 3
    or jsonb_array_length(p_corpus_snapshots) not between 1 and 5
  then raise sqlstate 'PT422' using message = 'Invalid speaking plan size.'; end if;
  select array_agg((value->>'corpus_item_id')::uuid order by ordinal)
    into v_ids from jsonb_array_elements(p_corpus_snapshots) with ordinality source(value, ordinal);
  if array_position(v_ids, null) is not null
    or (select count(distinct id) from unnest(v_ids) ids(id)) <> cardinality(v_ids)
  then raise sqlstate 'PT422' using message = 'Invalid speaking plan targets.'; end if;
  if p_plan->>'version' = '2' then
    if jsonb_typeof(p_plan->'logic_template') is distinct from 'object'
      or coalesce(p_plan->'logic_template'->>'id', '') not in
        ('persuasive_pitch','technical_troubleshoot','stakeholder_alignment','status_update','disagreement','onboarding')
      or jsonb_typeof(p_plan->'logic_template'->'steps') is distinct from 'array'
      or jsonb_typeof(p_plan->'logic_template'->'title') is distinct from 'string'
      or jsonb_typeof(p_plan->'logic_template'->'description') is distinct from 'string'
      or length(btrim(coalesce(p_plan->'logic_template'->>'title',''))) not between 1 and 500
      or length(btrim(coalesce(p_plan->'logic_template'->>'description',''))) not between 1 and 500
    then raise sqlstate 'PT422' using message = 'Invalid planned logic.'; end if;
    if jsonb_array_length(p_plan->'logic_template'->'steps') not between 1 and 12
      or exists (select 1 from jsonb_array_elements(p_plan->'logic_template'->'steps') step
        where jsonb_typeof(step) <> 'string' or length(btrim(step #>> '{}')) not between 1 and 500)
    then raise sqlstate 'PT422' using message = 'Invalid planned stages.'; end if;
  end if;
  for v_candidate in select value from jsonb_array_elements(p_plan->'candidates') loop
    if jsonb_typeof(v_candidate->'targets') is distinct from 'array' then
      raise sqlstate 'PT422' using message = 'Invalid scenario targets.';
    end if;
    if (select array_agg((value->>'corpus_item_id')::uuid order by ordinal)
      from jsonb_array_elements(v_candidate->'targets') with ordinality targets(value, ordinal))
      is distinct from v_ids then
      raise sqlstate 'PT422' using message = 'Scenario targets do not match the plan.';
    end if;
    select count(*) filter (where value->>'role' = 'primary') into v_count
      from jsonb_array_elements(v_candidate->'targets');
    if v_count not between 1 and 5 or cardinality(v_ids) - v_count > 2
      or exists (select 1 from jsonb_array_elements(v_candidate->'targets')
        where coalesce(value->>'role', '') not in ('primary', 'opportunity')
          or coalesce(value->>'fit', '') not in ('high', 'medium', 'low', 'unknown')
          or length(btrim(coalesce(value->>'trigger_question', ''))) = 0)
    then raise sqlstate 'PT422' using message = 'Invalid scenario roles or opportunities.'; end if;
    if p_plan->>'version' = '2' then
      if exists (select 1 from jsonb_array_elements(v_candidate->'targets') t
        where t->>'role' <> 'primary'
          or not (t ? 'stage_index')
          or (t->'stage_index' <> 'null'::jsonb and
            (jsonb_typeof(t->'stage_index') <> 'number' or (t->>'stage_index') !~ '^[0-9]+$'))
          or jsonb_typeof(t->'model_line') is distinct from 'string'
          or length(btrim(t->>'model_line')) not between 1 and 500)
      then raise sqlstate 'PT422' using message = 'Invalid staged target.'; end if;
      if exists (select 1 from jsonb_array_elements(v_candidate->'targets') t
        where t->'stage_index' <> 'null'::jsonb
          and (t->>'stage_index')::numeric >= jsonb_array_length(p_plan->'logic_template'->'steps'))
      then raise sqlstate 'PT422' using message = 'Target stage is outside the planned logic.'; end if;
      if (select jsonb_agg(t->'stage_index' order by ord)
          from jsonb_array_elements(v_candidate->'targets') with ordinality x(t,ord))
        is distinct from (select jsonb_agg(t->'stage_index' order by ord)
          from jsonb_array_elements(p_plan->'candidates'->0->'targets') with ordinality x(t,ord))
      then raise sqlstate 'PT422' using message = 'Candidate stages do not match.'; end if;
    end if;
  end loop;
  perform c.id from public.corpus_items c
    where c.id = any(v_ids) and c.user_id = p_user_id order by c.id for share;
  select jsonb_agg(public.speaking_corpus_snapshot(c) order by requested.ordinal)
    into v_current from unnest(v_ids) with ordinality requested(id, ordinal)
    join public.corpus_items c on c.id = requested.id and c.user_id = p_user_id;
  if coalesce(jsonb_array_length(v_current), 0) <> cardinality(v_ids) then
    raise sqlstate 'PT404' using message = 'Selected corpus items are unavailable.';
  end if;
  if v_current is distinct from p_corpus_snapshots then
    raise sqlstate 'PT412' using message = 'Selected language changed during planning.';
  end if;
  insert into public.profiles(id) values (p_user_id) on conflict (id) do nothing;
  insert into public.speaking_plans(id, user_id, document, corpus_snapshots, content_hash, created_at)
    values ((p_plan->>'id')::uuid, p_user_id, p_plan, p_corpus_snapshots,
      encode(sha256(convert_to(p_corpus_snapshots::text, 'UTF8')), 'hex'), (p_plan->>'created_at')::timestamptz)
    on conflict (id) do nothing;
  select * into v_existing from public.speaking_plans where id = (p_plan->>'id')::uuid;
  if v_existing.user_id is distinct from p_user_id or v_existing.document is distinct from p_plan
    or v_existing.corpus_snapshots is distinct from p_corpus_snapshots then
    raise sqlstate 'PT409' using message = 'Plan ID already belongs to different content.';
  end if;
  return v_existing.document;
end;
$$;

revoke all on function public.save_speaking_plan(text, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.save_speaking_plan(text, jsonb, jsonb) to service_role;

create or replace function public.create_planned_speaking_loadout(
  p_user_id text, p_client_id uuid, p_scenario_type text, p_goal text,
  p_difficulty text, p_feedback_level text, p_logic_template jsonb,
  p_corpus_item_ids uuid[], p_plan_id uuid, p_candidate_id uuid
)
returns jsonb language plpgsql security invoker set search_path = ''
as $$
declare
  v_request jsonb;
  v_existing public.speaking_sessions%rowtype;
  v_plan public.speaking_plans%rowtype;
  v_candidate jsonb;
  v_current jsonb;
  v_created jsonb;
  v_session_id uuid;
  v_targets jsonb;
begin
  if p_user_id is null or length(btrim(p_user_id)) = 0 or p_client_id is null
    or p_plan_id is null or p_candidate_id is null then
    raise sqlstate 'PT422' using message = 'A saved plan and candidate are required.';
  end if;
  v_request := jsonb_build_object(
    'scenario_type', p_scenario_type, 'goal', btrim(p_goal), 'difficulty', p_difficulty,
    'feedback_level', p_feedback_level, 'logic_template_id', p_logic_template->>'id',
    'corpus_item_ids', to_jsonb(p_corpus_item_ids), 'plan_id', p_plan_id, 'candidate_id', p_candidate_id);
  perform pg_advisory_xact_lock(hashtextextended(p_user_id || ':' || p_client_id::text, 0));
  select * into v_existing from public.speaking_sessions
    where user_id = p_user_id and client_id = p_client_id;
  -- Recovery precedes plan/source lookup so deletion cannot break a committed retry.
  if found then
    if v_existing.request_payload is distinct from v_request then
      raise sqlstate 'PT409' using message = 'Submission already used for a different loadout.';
    end if;
    return public.get_speaking_loadout(p_user_id, v_existing.id);
  end if;
  select * into v_plan from public.speaking_plans
    where id = p_plan_id and user_id = p_user_id;
  if not found then raise sqlstate 'PT404' using message = 'Speaking plan not found.'; end if;
  select value into v_candidate from jsonb_array_elements(v_plan.document->'candidates')
    where value->>'id' = p_candidate_id::text;
  if v_candidate is null then raise sqlstate 'PT404' using message = 'Speaking scenario not found.'; end if;
  if v_plan.document->>'scenario_type' is distinct from p_scenario_type
    or v_candidate->>'goal' is distinct from btrim(p_goal)
    or (select array_agg((value->>'corpus_item_id')::uuid order by ordinal)
      from jsonb_array_elements(v_candidate->'targets') with ordinality targets(value, ordinal))
      is distinct from p_corpus_item_ids
  then raise sqlstate 'PT409' using message = 'Scenario does not match the submitted setup.'; end if;
  if v_plan.document->>'version' = '2'
    and v_plan.document->'logic_template'->>'id' is distinct from p_logic_template->>'id' then
    raise sqlstate 'PT409' using message = 'Logic does not match the saved plan.';
  end if;
  if exists (select 1 from jsonb_array_elements(v_candidate->'targets')
    where value->>'role' = 'primary' and coalesce(value->>'fit', '') not in ('high', 'medium')) then
    raise sqlstate 'PT424' using message = 'Primary targets must fit the selected scenario.';
  end if;
  perform c.id from public.corpus_items c
    where c.id = any(p_corpus_item_ids) and c.user_id = p_user_id order by c.id for share;
  select jsonb_agg(public.speaking_corpus_snapshot(c) order by requested.ordinal)
    into v_current from unnest(p_corpus_item_ids) with ordinality requested(id, ordinal)
    join public.corpus_items c on c.id = requested.id and c.user_id = p_user_id;
  if coalesce(jsonb_array_length(v_current), 0) <> cardinality(p_corpus_item_ids) then
    raise sqlstate 'PT404' using message = 'Selected corpus items are unavailable.';
  end if;
  if v_current is distinct from v_plan.corpus_snapshots
    or encode(sha256(convert_to(v_current::text, 'UTF8')), 'hex') is distinct from v_plan.content_hash then
    raise sqlstate 'PT412' using message = 'Selected language changed after planning.';
  end if;
  v_created := public.create_speaking_loadout(
    p_user_id, p_client_id, p_scenario_type, p_goal, p_difficulty,
    p_feedback_level, p_logic_template, p_corpus_item_ids);
  v_session_id := (v_created->>'id')::uuid;
  select jsonb_agg(target.value || jsonb_build_object('session_item_id', i.id) order by target.ordinal)
    into v_targets from jsonb_array_elements(v_candidate->'targets') with ordinality target(value, ordinal)
    join public.speaking_session_items i on i.session_id = v_session_id
      and i.corpus_item_id = (target.value->>'corpus_item_id')::uuid;
  update public.speaking_sessions set request_payload = v_request,
    logic_template = case when v_plan.document->>'version' = '2'
      then v_plan.document->'logic_template' else logic_template end,
    mission_plan = (v_candidate - array['id', 'targets']) || jsonb_build_object(
      'plan_id', p_plan_id, 'candidate_id', p_candidate_id,
      'version', (v_plan.document->>'version')::integer,
      'scenario_type', p_scenario_type, 'targets', v_targets)
      || case when v_plan.document->>'version' = '2'
        then jsonb_build_object('logic_template', v_plan.document->'logic_template') else '{}'::jsonb end
    where id = v_session_id and user_id = p_user_id;
  return public.get_speaking_loadout(p_user_id, v_session_id);
end;
$$;

revoke all on function public.create_planned_speaking_loadout(text,uuid,text,text,text,text,jsonb,uuid[],uuid,uuid) from public,anon,authenticated;
grant execute on function public.create_planned_speaking_loadout(text,uuid,text,text,text,text,jsonb,uuid[],uuid,uuid) to service_role;

create or replace function public.validate_speaking_practice(
  p_user_id text, p_plan jsonb, p_snapshots jsonb
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  v_source jsonb := p_plan->'practice_source';
  v_parent public.speaking_sessions%rowtype;
  v_candidate jsonb;
  v_changes jsonb;
  v_target jsonb;
  v_snapshot jsonb;
  v_item public.speaking_session_items%rowtype;
  v_variation text;
begin
  if jsonb_typeof(v_source) is distinct from 'object'
    or coalesce(v_source->>'parent_snapshot_hash','') !~ '^[a-f0-9]{64}$'
    or coalesce(v_source->>'variation','') not in ('details','role_swap')
  then raise sqlstate 'PT425' using message = 'Invalid linked practice source.'; end if;
  select * into v_parent from public.speaking_sessions
    where id=(v_source->>'parent_session_id')::uuid and user_id=p_user_id for share;
  if not found or v_parent.status <> 'completed' or v_parent.mission_plan is null then
    raise sqlstate 'PT425' using message = 'Completed planned parent is required.';
  end if;
  if v_source->>'root_session_id' is distinct from
      coalesce(v_parent.practice->>'root_session_id', v_parent.id::text)
    or p_plan->>'scenario_type' is distinct from v_parent.scenario_type
    or jsonb_array_length(p_snapshots) <> jsonb_array_length(v_parent.mission_plan->'targets')
  then raise sqlstate 'PT425' using message = 'Practice lineage does not match the parent.'; end if;
  -- Linked v2 rounds keep the parent's chosen structure and target placement.
  -- Scene-specific model lines may change, but the selected logic cannot.
  if p_plan->>'version' is distinct from coalesce(v_parent.mission_plan->>'version','1')
    or (v_parent.mission_plan->>'version' = '2'
      and p_plan->'logic_template' is distinct from v_parent.mission_plan->'logic_template'
  ) then raise sqlstate 'PT425' using message = 'Practice must preserve the parent logic.'; end if;
  for v_target in select value from jsonb_array_elements(v_parent.mission_plan->'targets') loop
    select * into v_item from public.speaking_session_items
      where id=(v_target->>'session_item_id')::uuid and session_id=v_parent.id;
    select value into v_snapshot from jsonb_array_elements(p_snapshots)
      where value->>'corpus_item_id'=v_target->>'corpus_item_id';
    if v_item.id is null or v_snapshot is null
      or v_snapshot->>'corpus_item_id' is distinct from coalesce(
        v_item.source_corpus_item_id::text, v_item.corpus_item_id::text)
      or jsonb_build_object('kind',v_item.kind,'text',v_item.text_snapshot,
        'meaning',v_item.meaning_snapshot,'slots',v_item.slots_snapshot)
        is distinct from jsonb_build_object('kind',v_snapshot->'kind','text',v_snapshot->'text',
          'meaning',v_snapshot->'meaning','slots',v_snapshot->'slots')
    then raise sqlstate 'PT425' using message = 'Parent language changed or is unavailable.'; end if;
  end loop;
  v_variation := v_source->>'variation';
  for v_candidate in select value from jsonb_array_elements(p_plan->'candidates') loop
    if (select jsonb_agg(jsonb_build_object('corpus_item_id',value->'corpus_item_id','role',value->'role') order by ord)
        from jsonb_array_elements(v_candidate->'targets') with ordinality t(value,ord))
      is distinct from
      (select jsonb_agg(jsonb_build_object('corpus_item_id',value->'corpus_item_id','role',value->'role') order by ord)
        from jsonb_array_elements(v_parent.mission_plan->'targets') with ordinality t(value,ord))
    then raise sqlstate 'PT425' using message = 'Practice targets must preserve the parent roles.'; end if;
    if v_parent.mission_plan->>'version' = '2' and
      (select jsonb_agg(jsonb_build_object('corpus_item_id',value->'corpus_item_id',
          'stage_index',value->'stage_index') order by ord)
        from jsonb_array_elements(v_candidate->'targets') with ordinality t(value,ord))
      is distinct from
      (select jsonb_agg(jsonb_build_object('corpus_item_id',value->'corpus_item_id',
          'stage_index',value->'stage_index') order by ord)
        from jsonb_array_elements(v_parent.mission_plan->'targets') with ordinality t(value,ord))
    then raise sqlstate 'PT425' using message = 'Practice must preserve the parent target stages.'; end if;
    if v_variation='details' and (
      v_candidate->>'user_role' is distinct from v_parent.mission_plan->>'user_role'
      or v_candidate->>'ai_role' is distinct from v_parent.mission_plan->>'ai_role'
      or (btrim(regexp_replace(lower(v_candidate->>'setting'),'\W+',' ','g'))
            = btrim(regexp_replace(lower(v_parent.mission_plan->>'setting'),'\W+',' ','g'))
        and btrim(regexp_replace(lower(v_candidate->>'goal'),'\W+',' ','g'))
            = btrim(regexp_replace(lower(v_parent.mission_plan->>'goal'),'\W+',' ','g')))
    ) then raise sqlstate 'PT425' using message = 'Practice details must change while preserving roles.'; end if;
    if v_variation='role_swap' and (
      v_candidate->>'user_role' is distinct from v_parent.mission_plan->>'ai_role'
      or v_candidate->>'ai_role' is distinct from v_parent.mission_plan->>'user_role'
      or btrim(regexp_replace(lower(v_parent.mission_plan->>'user_role'),'\W+',' ','g'))
         = btrim(regexp_replace(lower(v_parent.mission_plan->>'ai_role'),'\W+',' ','g'))
    ) then raise sqlstate 'PT425' using message = 'Practice must swap distinct parent roles.'; end if;
    select coalesce(jsonb_agg(jsonb_build_object(
      'field',field,'before',v_parent.mission_plan->field,'after',v_candidate->field) order by ord),'[]')
      into v_changes from unnest(array['setting','goal','user_role','ai_role']) with ordinality f(field,ord)
      where v_parent.mission_plan->field is distinct from v_candidate->field;
    if v_candidate->'changes' is distinct from v_changes then
      raise sqlstate 'PT425' using message = 'Practice change descriptions do not match the scenarios.';
    end if;
  end loop;
  return v_parent.id;
end;
$$;
revoke all on function public.validate_speaking_practice(text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.validate_speaking_practice(text,jsonb,jsonb) to service_role;


-- Freeze the revision-bound delivery/effect proof for v2 assessment.
create or replace function public.enqueue_speaking_feedback(p_user_id text, p_session_id uuid, p_retry boolean default false)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_session public.speaking_sessions%rowtype;
  v_job public.speaking_feedback%rowtype;
  v_document jsonb;
  v_source jsonb;
begin
  if p_user_id is null or length(btrim(p_user_id)) = 0 or p_session_id is null or p_retry is null then
    raise sqlstate 'PT422' using message = 'Invalid speaking feedback state.';
  end if;
  -- Runtime CAS, enqueue, complete and deletion serialize on this same parent.
  select * into v_session from public.speaking_sessions
    where id = p_session_id and user_id = p_user_id and client_id is not null for update;
  if not found then return null; end if;
  if v_session.status <> 'completed' then
    raise sqlstate 'PT409' using message = 'End this session before requesting feedback.';
  end if;
  select * into v_job from public.speaking_feedback where session_id = p_session_id for update;
  if found then
    if v_job.source is null then
      raise sqlstate 'PT422' using message = 'Legacy feedback cannot be reprocessed.';
    end if;
    if p_retry and v_job.status in ('partial','failed') and v_job.attempts < 3
      and coalesce(v_job.error_code,'') not in ('input_limit','worker_version_mismatch') then
      update public.speaking_feedback set status = 'queued', error_code = null,
        lease_token = null, lease_expires_at = null, updated_at = clock_timestamp()
        where id = v_job.id;
    end if;
    return public.read_speaking_feedback(p_user_id, p_session_id);
  end if;
  select document into v_document from public.speaking_runtime_state where session_id = p_session_id;
  v_document := coalesce(v_document, '{}'::jsonb);
  -- Do not copy the private runtime, authentication ticket or provider instructions.
  v_source := jsonb_build_object(
    'session', public.get_speaking_loadout(p_user_id, p_session_id),
    'messages', coalesce((select jsonb_agg((select coalesce(jsonb_object_agg(key,value), '{}'::jsonb)
      from jsonb_each(row) where key = any(array['id','ordinal','role','text','input_source','status',
        'revision','provider_item_id','response_id','client_turn_id','created_at','started_at','finalized_at'])) order by ord)
      from jsonb_array_elements(coalesce(v_document->'messages','[]'::jsonb)) with ordinality as m(row,ord)
      where jsonb_typeof(row) = 'object'), '[]'::jsonb),
    'evidence', coalesce((select jsonb_agg((select coalesce(jsonb_object_agg(key,value), '{}'::jsonb)
      from jsonb_each(row) where key = any(array['id','session_item_id','message_id','transcript_revision',
        'start','end','quote','match_type','appropriateness','prompted','assistance','reason'])) order by ord)
      from jsonb_array_elements(coalesce(v_document->'evidence','[]'::jsonb)) with ordinality as e(row,ord)
      where jsonb_typeof(row) = 'object'), '[]'::jsonb),
    'controller', jsonb_build_object('exposures', coalesce((select jsonb_agg((select
      coalesce(jsonb_object_agg(key,value), '{}'::jsonb) from jsonb_each(row)
      where key = any(array['id','target_item_id','source_message_id','source_revision','after_turn','kind','level','visible_at','overlap','response_id','scope','certainty'])) order by ord)
      from jsonb_array_elements(coalesce(v_document->'controller'->'exposures','[]'::jsonb))
        with ordinality as x(row,ord) where jsonb_typeof(row) = 'object'), '[]'::jsonb)),
    'teaching_attempts', coalesce((select jsonb_agg(
      (select coalesce(jsonb_object_agg(key,value), '{}'::jsonb) from jsonb_each(row)
        where key = any(array['id','response_id','sent_at','bound_at','send_status','presented','presented_at',
          'assessment_message_id','assessment_revision','presented_message_id','presented_revision']))
      || jsonb_build_object(
        'policy', (select coalesce(jsonb_object_agg(key,value), '{}'::jsonb)
          from jsonb_each(coalesce(row->'policy','{}'::jsonb)) where key = any(array['target_item_id','action','support_level','support_version'])),
        'assessment', (select coalesce(jsonb_object_agg(key,value), '{}'::jsonb)
          from jsonb_each(coalesce(row->'assessment','{}'::jsonb)) where key = any(array['outcome','reason','exact_quote','model_quote','transfer_question_quote']))
      ) order by ord)
      from jsonb_array_elements(coalesce(v_document->'teaching_attempts','[]'::jsonb))
        with ordinality as a(row,ord) where jsonb_typeof(row) = 'object'), '[]'::jsonb),
    'target_states', coalesce((select jsonb_object_agg(target.key,
      (select coalesce(jsonb_object_agg(key,value), '{}'::jsonb) from jsonb_each(target.value)
        where key = any(array['skipped','reason','skipped_at','restored_at','version']))
      || jsonb_build_object('history', coalesce((select jsonb_agg(
        (select coalesce(jsonb_object_agg(key,value), '{}'::jsonb) from jsonb_each(event)
          where key = any(array['action','at','reason'])) order by ord)
        from jsonb_array_elements(coalesce(target.value->'history','[]'::jsonb))
          with ordinality as h(event,ord) where jsonb_typeof(event) = 'object'), '[]'::jsonb)))
      from jsonb_each(coalesce(v_document->'target_states','{}'::jsonb)) as target
      where jsonb_typeof(target.value) = 'object'), '{}'::jsonb)
  );
  if jsonb_typeof(v_document->'support') = 'object' then
    v_source := v_source || jsonb_build_object('support',
      (select coalesce(jsonb_object_agg(key,value),'{}'::jsonb)
        from jsonb_each(v_document->'support') where key = any(array['level','version'])));
  end if;
  if jsonb_typeof(v_document->'support_history') = 'array' then
    v_source := v_source || jsonb_build_object('support_history',coalesce((select jsonb_agg(
      (select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) from jsonb_each(event)
        where key = any(array['level','version','at'])) order by ord)
      from jsonb_array_elements(v_document->'support_history') with ordinality as h(event,ord)
      where jsonb_typeof(event) = 'object'),'[]'::jsonb));
  end if;
  if octet_length(v_source::text) > 2097152 then
    raise sqlstate 'PT422' using message = 'Invalid speaking feedback state.';
  end if;
  insert into public.speaking_feedback(session_id,status,source,input_hash,rubric_version,analysis_version)
    values (p_session_id,'queued',v_source,encode(sha256(convert_to(v_source::text, 'UTF8')),'hex'),
      'speaking-rubric-v2','speaking-feedback-v3');
  return public.read_speaking_feedback(p_user_id, p_session_id);
end;
$$;

revoke all on function public.enqueue_speaking_feedback(text,uuid,boolean) from public,anon,authenticated;
grant execute on function public.enqueue_speaking_feedback(text,uuid,boolean) to service_role;
