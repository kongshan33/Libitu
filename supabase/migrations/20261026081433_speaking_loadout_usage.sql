-- Stage 3 needs all retained target Missions, including missing/old assessments.
-- This read does not enqueue assessment or mutate session/runtime/mastery state.
create index speaking_session_items_source_lookup_idx on public.speaking_session_items
  ((coalesce(source_corpus_item_id, corpus_item_id)), session_id);

create function public.read_speaking_loadout_usage(
  p_user_id text, p_corpus_item_ids uuid[], p_limit integer default 100
)
returns jsonb language plpgsql stable security invoker set search_path = '' as $$
declare
  v_result jsonb;
begin
  if p_user_id is null or length(btrim(p_user_id)) = 0
    or p_corpus_item_ids is null or cardinality(p_corpus_item_ids) not between 1 and 500
    or array_position(p_corpus_item_ids,null) is not null
    or (select count(distinct id) from unnest(p_corpus_item_ids) id) <> cardinality(p_corpus_item_ids)
    or p_limit is null or p_limit not between 1 and 100 then
    raise sqlstate 'PT422' using message = 'Invalid Loadout history selection.';
  end if;
  if (select count(*) from public.corpus_items where user_id=p_user_id and id=any(p_corpus_item_ids))
      <> cardinality(p_corpus_item_ids) then
    raise sqlstate 'PT404' using message = 'Selected language is unavailable.';
  end if;
  with selected as (
    select corpus_id,ord from unnest(p_corpus_item_ids) with ordinality item(corpus_id,ord)
  ), projected as (
    select c.ord,jsonb_build_object('corpus_item_id',c.corpus_id,
      'has_more',r.total > p_limit,'missions',coalesce(r.missions,'[]'::jsonb)) row
    from selected c cross join lateral (
      with recent as materialized (
        select s.id session_id,s.status session_status,s.turn_count,s.created_at,i.id item_id,
          f.id report_id,f.status report_status,f.rubric_version,f.analysis_version,f.source,f.result
        from public.speaking_session_items i
        join public.speaking_sessions s on s.id=i.session_id and s.user_id=p_user_id
        left join public.speaking_feedback f on f.session_id=s.id
        where coalesce(i.source_corpus_item_id,i.corpus_item_id)=c.corpus_id
        order by s.created_at desc,s.id desc,i.id desc limit p_limit+1
      ), bounded as (
        select * from recent order by created_at desc,session_id desc,item_id desc limit p_limit
      )
      select (select count(*) from recent) total,
        jsonb_agg(jsonb_build_object('session_id',b.session_id,'session_status',b.session_status,
          'turn_count',b.turn_count,'report',case
            when b.report_id is null or b.source->'session'->>'user_id' is distinct from p_user_id then null
            else jsonb_build_object('id',b.report_id,'session_id',b.session_id,'status',b.report_status,
              'rubric_version',b.rubric_version,'analysis_version',b.analysis_version,
              'evidence_contract_version',b.source->'session'->'evidence_contract_version',
              'root_session_id',coalesce(b.source->'session'->'practice'->>'root_session_id',b.session_id::text),
              'scene',coalesce((select jsonb_object_agg(key,value)
                from jsonb_each(coalesce(nullif(b.source->'session'->'mission_plan','null'::jsonb),'{}'::jsonb))
                where key=any(array['setting','goal','user_role','ai_role'])),'{}'::jsonb),
              'items',coalesce((
                select jsonb_agg(jsonb_build_object(
                  'item',(select jsonb_object_agg(key,value) from jsonb_each(item)
                    where key=any(array['id','source_corpus_item_id','kind','text','meaning','slots'])),
                  'target_role',(select t->'role'
                    from jsonb_array_elements(coalesce(b.source->'session'->'mission_plan'->'targets','[]'::jsonb)) t
                    where t->>'session_item_id'=item->>'id' limit 1),
                  'skipped',coalesce(b.source->'target_states'->(item->>'id')->'skipped','false'::jsonb),
                  'result',coalesce((select jsonb_object_agg(key,value) from jsonb_each(coalesce(a.result,'{}'::jsonb))
                    where key=any(array['session_item_id','status','role','opportunity_status','excluded_reason',
                      'independent_uses','prompted_uses','imitation_uses','uncertain_assistance_uses',
                      'evidence','qualifying_independent_evidence'])),'{}'::jsonb),
                  'messages',coalesce((
                    select jsonb_agg((select jsonb_object_agg(key,value) from jsonb_each(m)
                      where key=any(array['id','role','status','revision','text','ordinal','created_at','started_at','finalized_at'])))
                    from jsonb_array_elements(coalesce(b.source->'messages','[]'::jsonb)) m
                    where exists (select 1 from jsonb_array_elements(
                      coalesce(a.result->'evidence','[]'::jsonb) ||
                      coalesce(a.result->'qualifying_independent_evidence','[]'::jsonb)) e
                      where e->>'message_id'=m->>'id')
                  ),'[]'::jsonb)
                ))
                from jsonb_array_elements(coalesce(b.source->'session'->'items','[]'::jsonb)) item
                left join lateral (
                  select case when count(*)=1 then (jsonb_agg(value))->0 else '{}'::jsonb end result
                  from jsonb_array_elements(coalesce(b.result->'item_results','[]'::jsonb)) value
                  where value->>'session_item_id'=item->>'id'
                ) a on true
                where item->>'id'=b.item_id::text and item->>'source_corpus_item_id'=c.corpus_id::text
              ),'[]'::jsonb)) end
        ) order by b.created_at desc,b.session_id desc,b.item_id desc) missions
      from bounded b
    ) r
  )
  select jsonb_build_object('items',coalesce(jsonb_agg(row order by ord),'[]'::jsonb)) into v_result from projected;
  return v_result;
end;
$$;

revoke all on function public.read_speaking_loadout_usage(text,uuid[],integer) from public,anon,authenticated;
grant execute on function public.read_speaking_loadout_usage(text,uuid[],integer) to service_role;
