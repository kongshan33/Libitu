-- Stage 3 catalog: real Travel scenarios and the three daily-life structures.
-- Existing payloads/snapshots and service-role-only creation remain unchanged.
alter table public.speaking_sessions drop constraint speaking_sessions_scenario_type_valid;
alter table public.speaking_sessions add constraint speaking_sessions_scenario_type_valid
  check (scenario_type in ('workplace', 'everyday', 'travel'));

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
    or coalesce(p_plan->>'scenario_type', '') not in ('workplace', 'everyday', 'travel')
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
        ('persuasive_pitch','technical_troubleshoot','stakeholder_alignment','status_update','disagreement','onboarding','telling_story','making_plans','catching_up')
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

create or replace function public.create_speaking_loadout(
  p_user_id text, p_client_id uuid, p_scenario_type text, p_goal text,
  p_difficulty text, p_feedback_level text, p_logic_template jsonb, p_corpus_item_ids uuid[]
)
returns jsonb language plpgsql security invoker set search_path = ''
as $$
declare
  v_request jsonb;
  v_existing public.speaking_sessions%rowtype;
  v_session_id uuid;
  v_selected_count integer;
  v_structures integer;
  v_expressions integer;
begin
  if p_user_id is null or length(btrim(p_user_id)) = 0 or p_client_id is null
    or p_scenario_type is null or p_scenario_type not in ('workplace', 'everyday', 'travel')
    or p_goal is null or length(btrim(p_goal)) not between 1 and 500
    or p_difficulty is null or p_difficulty not in ('guided', 'standard', 'challenging')
    or p_feedback_level is null or p_feedback_level not in ('light', 'balanced', 'detailed')
    or p_corpus_item_ids is null or cardinality(p_corpus_item_ids) not between 0 and 8
    or (cardinality(p_corpus_item_ids) = 0 and p_logic_template is not null)
    or array_position(p_corpus_item_ids, null) is not null
    or (select count(distinct id) from unnest(p_corpus_item_ids) ids(id)) <> cardinality(p_corpus_item_ids)
  then raise sqlstate 'PT422' using message = 'Invalid speaking loadout.'; end if;
  if p_logic_template is not null and (
    jsonb_typeof(p_logic_template) <> 'object'
    or coalesce(p_logic_template->>'id', '') not in (
      'persuasive_pitch', 'technical_troubleshoot', 'stakeholder_alignment',
      'status_update', 'disagreement', 'onboarding', 'telling_story', 'making_plans', 'catching_up')
    or jsonb_typeof(p_logic_template->'steps') is distinct from 'array'
  ) then raise sqlstate 'PT422' using message = 'Invalid logic template.'; end if;
  v_request := jsonb_build_object(
    'scenario_type', p_scenario_type, 'goal', btrim(p_goal), 'difficulty', p_difficulty,
    'feedback_level', p_feedback_level, 'logic_template_id', p_logic_template->>'id',
    'corpus_item_ids', to_jsonb(p_corpus_item_ids));
  perform pg_advisory_xact_lock(hashtextextended(p_user_id || ':' || p_client_id::text, 0));
  select * into v_existing from public.speaking_sessions
    where user_id = p_user_id and client_id = p_client_id;
  if found then
    if v_existing.request_payload is distinct from v_request then
      raise sqlstate 'PT409' using message = 'Submission already used for a different loadout.';
    end if;
    return public.get_speaking_loadout(p_user_id, v_existing.id);
  end if;
  perform c.id from public.corpus_items c
    where c.id = any(p_corpus_item_ids) and c.user_id = p_user_id order by c.id for share;
  select count(*), count(*) filter (where kind = 'structure'),
    count(*) filter (where kind in ('chunk', 'idiom'))
    into v_selected_count, v_structures, v_expressions
    from public.corpus_items where id = any(p_corpus_item_ids) and user_id = p_user_id;
  if v_selected_count <> cardinality(p_corpus_item_ids) then
    raise sqlstate 'PT404' using message = 'Selected corpus items are unavailable.';
  end if;
  if (v_selected_count > 5 and (v_structures > 3 or v_expressions > 5))
    or v_structures + v_expressions <> v_selected_count then
    raise sqlstate 'PT422' using message = 'Loadout selection limits exceeded.';
  end if;
  insert into public.profiles(id) values (p_user_id) on conflict (id) do nothing;
  insert into public.speaking_sessions(
    user_id, client_id, request_payload, scenario_type, goal, difficulty,
    feedback_level, logic_template, status
  ) values (
    p_user_id, p_client_id, v_request, p_scenario_type, btrim(p_goal), p_difficulty,
    p_feedback_level, p_logic_template, 'draft'
  ) returning id into v_session_id;
  insert into public.speaking_session_items(
    session_id, corpus_item_id, ordinal, kind, text_snapshot, tags_snapshot,
    slots_snapshot, meaning_snapshot, source_title_snapshot,
    usage_note_snapshot, register_snapshot, scenario_tags_snapshot, pattern_family_snapshot
  )
  select v_session_id, c.id, (requested.ordinal - 1)::integer, c.kind, c.text,
    c.tags, c.slots, c.meaning, c.source_locator->>'source_title',
    c.usage_context, public.speaking_corpus_snapshot(c)->>'register',
    public.speaking_corpus_snapshot(c)->'scenario_tags', public.speaking_corpus_snapshot(c)->>'pattern_family'
  from unnest(p_corpus_item_ids) with ordinality requested(id, ordinal)
  join public.corpus_items c on c.id = requested.id and c.user_id = p_user_id;
  return public.get_speaking_loadout(p_user_id, v_session_id);
end;
$$;

revoke all on function public.create_speaking_loadout(text, uuid, text, text, text, text, jsonb, uuid[]) from public, anon, authenticated;
grant execute on function public.create_speaking_loadout(text, uuid, text, text, text, text, jsonb, uuid[]) to service_role;
