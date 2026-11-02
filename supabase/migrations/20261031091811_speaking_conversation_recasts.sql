-- Freeze grounded Stage 4 recasts for report-only classification.
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
  -- Optional, bounded recasts are frozen with the original transcript. Old jobs
  -- and old sources are never rewritten. No runtime/provider control enters here.
  if jsonb_typeof(v_document->'recasts') = 'array' then
    v_source := v_source || jsonb_build_object('recasts', coalesce((select jsonb_agg(
      (select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) from jsonb_each(row)
        where key = any(array['id','version','replacement','status','category','reason','rule_key','validated','presented_at','visual_at']))
      || jsonb_build_object(
        'source', (select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) from jsonb_each(row->'source')
          where key = any(array['message_id','revision','start','end','quote'])),
        'delivery', case when jsonb_typeof(row->'delivery') = 'object' then
          (select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) from jsonb_each(row->'delivery')
            where key = any(array['message_id','revision','start','end','quote'])) else 'null'::jsonb end,
        'edits', (select coalesce(jsonb_agg((select coalesce(jsonb_object_agg(key,value),'{}'::jsonb)
          from jsonb_each(edit) where key = any(array['start','end','before','after'])) order by n),'[]'::jsonb)
          from jsonb_array_elements(row->'edits') with ordinality as e(edit,n) where jsonb_typeof(edit) = 'object'),
        'changed_spans', (select coalesce(jsonb_agg((select coalesce(jsonb_object_agg(key,value),'{}'::jsonb)
          from jsonb_each(span) where key = any(array['start','end','quote'])) order by n),'[]'::jsonb)
          from jsonb_array_elements(row->'changed_spans') with ordinality as e(span,n) where jsonb_typeof(span) = 'object')
      ) order by ord) from (
        select row,ord from jsonb_array_elements(v_document->'recasts') with ordinality as r(row,ord)
        where jsonb_typeof(row) = 'object' and row->'validated' = 'true'::jsonb
          and jsonb_typeof(row->'source') = 'object' and jsonb_typeof(row->'edits') = 'array'
          and jsonb_typeof(row->'changed_spans') = 'array'
        order by ord limit 100
      ) as safe_recasts), '[]'::jsonb));
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
