-- AKNO Copilot — schéma initial
-- Exécuter dans le SQL Editor Supabase (projet production).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.sites (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique,
  name text not null,
  domain text not null,
  url text not null,
  gsc_property text,
  created_at timestamptz not null default now(),
  constraint sites_domain_lowercase check (domain = lower(domain))
);

create table public.site_members (
  user_id uuid not null references auth.users (id) on delete cascade,
  site_id uuid not null references public.sites (id) on delete cascade,
  role text not null check (role in ('owner', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (user_id, site_id)
);

create index site_members_site_id_idx on public.site_members (site_id);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  type text not null check (type in ('pageview', 'click', 'conversion')),
  name text,
  path text,
  referrer_host text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device text check (device in ('mobile', 'desktop', 'tablet')),
  browser text,
  country text,
  city text,
  visitor_hash text not null,
  session_id text not null,
  duration_ms integer,
  created_at timestamptz not null default now()
);

create index events_site_created_at_idx on public.events (site_id, created_at desc);
create index events_site_type_created_at_idx on public.events (site_id, type, created_at desc);
create index events_site_path_idx on public.events (site_id, path);

create table public.pagespeed_runs (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  strategy text not null check (strategy in ('mobile', 'desktop')),
  performance smallint,
  accessibility smallint,
  best_practices smallint,
  seo smallint,
  lcp numeric,
  inp numeric,
  cls numeric,
  fcp numeric,
  tbt numeric,
  ttfb numeric,
  created_at timestamptz not null default now()
);

create index pagespeed_runs_site_created_at_idx
  on public.pagespeed_runs (site_id, created_at desc);

create table public.gsc_daily (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  date date not null,
  query text not null default '',
  page text not null default '',
  clicks integer not null default 0,
  impressions integer not null default 0,
  ctr numeric,
  position numeric,
  created_at timestamptz not null default now(),
  unique (site_id, date, query, page)
);

create index gsc_daily_site_date_idx on public.gsc_daily (site_id, date desc);

create table public.site_health (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  checked_at timestamptz not null default now(),
  is_up boolean not null default false,
  status_code integer,
  response_ms integer,
  ssl_issuer text,
  ssl_valid_to timestamptz,
  domain_expires_at timestamptz
);

create index site_health_site_checked_at_idx
  on public.site_health (site_id, checked_at desc);

-- ---------------------------------------------------------------------------
-- Accès membre (RLS)
-- ---------------------------------------------------------------------------

create or replace function public.user_site_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select site_id
  from public.site_members
  where user_id = auth.uid();
$$;

revoke all on function public.user_site_ids() from public;
grant execute on function public.user_site_ids() to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.sites enable row level security;
alter table public.site_members enable row level security;
alter table public.events enable row level security;
alter table public.pagespeed_runs enable row level security;
alter table public.gsc_daily enable row level security;
alter table public.site_health enable row level security;

create policy sites_select_member on public.sites
  for select to authenticated
  using (id in (select public.user_site_ids()));

create policy site_members_select_own on public.site_members
  for select to authenticated
  using (user_id = auth.uid());

create policy events_select_member on public.events
  for select to authenticated
  using (site_id in (select public.user_site_ids()));

create policy pagespeed_select_member on public.pagespeed_runs
  for select to authenticated
  using (site_id in (select public.user_site_ids()));

create policy gsc_select_member on public.gsc_daily
  for select to authenticated
  using (site_id in (select public.user_site_ids()));

create policy site_health_select_member on public.site_health
  for select to authenticated
  using (site_id in (select public.user_site_ids()));

-- Aucune policy INSERT/UPDATE/DELETE pour authenticated → écriture refusée côté client.

-- ---------------------------------------------------------------------------
-- Agrégats (période + période précédente de même durée)
-- ---------------------------------------------------------------------------

create or replace function public.copilot_period_bounds(
  p_start timestamptz,
  p_end timestamptz
)
returns table (
  cur_start timestamptz,
  cur_end timestamptz,
  prev_start timestamptz,
  prev_end timestamptz
)
language sql
immutable
as $$
  select
    p_start,
    p_end,
    p_start - (p_end - p_start),
    p_start;
$$;

create or replace function public.copilot_overview(
  p_site_id uuid,
  p_start timestamptz,
  p_end timestamptz
)
returns jsonb
language plpgsql
stable
security invoker
as $$
declare
  bounds record;
  cur_visitors bigint;
  cur_pageviews bigint;
  prev_visitors bigint;
  prev_pageviews bigint;
  avg_duration numeric;
  bounce_rate numeric;
begin
  if not exists (
    select 1 from public.site_members
    where site_id = p_site_id and user_id = auth.uid()
  ) then
    raise exception 'access denied';
  end if;

  select * into bounds from public.copilot_period_bounds(p_start, p_end);

  select count(distinct visitor_hash) into cur_visitors
  from public.events
  where site_id = p_site_id and type = 'pageview'
    and created_at >= bounds.cur_start and created_at < bounds.cur_end;

  select count(*) into cur_pageviews
  from public.events
  where site_id = p_site_id and type = 'pageview'
    and created_at >= bounds.cur_start and created_at < bounds.cur_end;

  select count(distinct visitor_hash) into prev_visitors
  from public.events
  where site_id = p_site_id and type = 'pageview'
    and created_at >= bounds.prev_start and created_at < bounds.prev_end;

  select count(*) into prev_pageviews
  from public.events
  where site_id = p_site_id and type = 'pageview'
    and created_at >= bounds.prev_start and created_at < bounds.prev_end;

  select coalesce(avg(duration_ms) filter (where duration_ms is not null), 0)
    into avg_duration
  from public.events
  where site_id = p_site_id and type = 'pageview'
    and created_at >= bounds.cur_start and created_at < bounds.cur_end;

  with sessions as (
    select session_id, count(*) as pv
    from public.events
    where site_id = p_site_id and type = 'pageview'
      and created_at >= bounds.cur_start and created_at < bounds.cur_end
    group by session_id
  )
  select case when count(*) = 0 then 0
    else round(100.0 * count(*) filter (where pv = 1) / count(*), 1)
  end into bounce_rate
  from sessions;

  return jsonb_build_object(
    'visitors', cur_visitors,
    'visitors_prev', prev_visitors,
    'pageviews', cur_pageviews,
    'pageviews_prev', prev_pageviews,
    'avg_duration_ms', round(avg_duration),
    'bounce_rate_pct', bounce_rate
  );
end;
$$;

grant execute on function public.copilot_overview(uuid, timestamptz, timestamptz) to authenticated;

create or replace function public.copilot_traffic_series(
  p_site_id uuid,
  p_start timestamptz,
  p_end timestamptz,
  p_grain text default 'day'
)
returns table (bucket date, visitors bigint, pageviews bigint)
language plpgsql
stable
security invoker
as $$
begin
  if not exists (
    select 1 from public.site_members
    where site_id = p_site_id and user_id = auth.uid()
  ) then
    raise exception 'access denied';
  end if;

  return query
  select
    (date_trunc(p_grain, e.created_at at time zone 'utc'))::date as bucket,
    count(distinct e.visitor_hash) as visitors,
    count(*) filter (where e.type = 'pageview') as pageviews
  from public.events e
  where e.site_id = p_site_id
    and e.type = 'pageview'
    and e.created_at >= p_start and e.created_at < p_end
  group by 1
  order by 1;
end;
$$;

grant execute on function public.copilot_traffic_series(uuid, timestamptz, timestamptz, text) to authenticated;

create or replace function public.copilot_referrer_breakdown(
  p_site_id uuid,
  p_start timestamptz,
  p_end timestamptz
)
returns table (label text, sessions bigint)
language sql
stable
security invoker
as $$
  select
    coalesce(nullif(referrer_host, ''), 'Direct') as label,
    count(distinct session_id) as sessions
  from public.events
  where site_id = p_site_id
    and type = 'pageview'
    and created_at >= p_start and created_at < p_end
    and site_id in (select public.user_site_ids())
  group by 1
  order by sessions desc;
$$;

grant execute on function public.copilot_referrer_breakdown(uuid, timestamptz, timestamptz) to authenticated;

create or replace function public.copilot_device_breakdown(
  p_site_id uuid,
  p_start timestamptz,
  p_end timestamptz
)
returns table (device text, sessions bigint)
language sql
stable
security invoker
as $$
  select coalesce(device, 'unknown') as device, count(distinct session_id) as sessions
  from public.events
  where site_id = p_site_id
    and type = 'pageview'
    and created_at >= p_start and created_at < p_end
    and site_id in (select public.user_site_ids())
  group by 1
  order by sessions desc;
$$;

grant execute on function public.copilot_device_breakdown(uuid, timestamptz, timestamptz) to authenticated;

create or replace function public.copilot_top_pages(
  p_site_id uuid,
  p_start timestamptz,
  p_end timestamptz,
  p_limit int default 10
)
returns table (path text, pageviews bigint)
language sql
stable
security invoker
as $$
  select coalesce(path, '/') as path, count(*) as pageviews
  from public.events
  where site_id = p_site_id
    and type = 'pageview'
    and created_at >= p_start and created_at < p_end
    and site_id in (select public.user_site_ids())
  group by 1
  order by pageviews desc
  limit p_limit;
$$;

grant execute on function public.copilot_top_pages(uuid, timestamptz, timestamptz, int) to authenticated;

create or replace function public.copilot_top_cities(
  p_site_id uuid,
  p_start timestamptz,
  p_end timestamptz,
  p_limit int default 10
)
returns table (city text, country text, visitors bigint)
language sql
stable
security invoker
as $$
  select coalesce(city, 'Inconnu') as city, coalesce(country, '') as country,
    count(distinct visitor_hash) as visitors
  from public.events
  where site_id = p_site_id
    and type = 'pageview'
    and created_at >= p_start and created_at < p_end
    and site_id in (select public.user_site_ids())
  group by 1, 2
  order by visitors desc
  limit p_limit;
$$;

grant execute on function public.copilot_top_cities(uuid, timestamptz, timestamptz, int) to authenticated;

create or replace function public.copilot_visitors_by_hour(
  p_site_id uuid,
  p_start timestamptz,
  p_end timestamptz
)
returns table (hour int, visitors bigint)
language sql
stable
security invoker
as $$
  select extract(hour from created_at at time zone 'utc')::int as hour,
    count(distinct visitor_hash) as visitors
  from public.events
  where site_id = p_site_id
    and type = 'pageview'
    and created_at >= p_start and created_at < p_end
    and site_id in (select public.user_site_ids())
  group by 1
  order by 1;
$$;

grant execute on function public.copilot_visitors_by_hour(uuid, timestamptz, timestamptz) to authenticated;

create or replace function public.copilot_conversions_by_day(
  p_site_id uuid,
  p_start timestamptz,
  p_end timestamptz
)
returns table (day date, conversions bigint)
language sql
stable
security invoker
as $$
  select (created_at at time zone 'utc')::date as day, count(*) as conversions
  from public.events
  where site_id = p_site_id
    and type = 'conversion'
    and created_at >= p_start and created_at < p_end
    and site_id in (select public.user_site_ids())
  group by 1
  order by 1;
$$;

grant execute on function public.copilot_conversions_by_day(uuid, timestamptz, timestamptz) to authenticated;

create or replace function public.copilot_conversions_by_type(
  p_site_id uuid,
  p_start timestamptz,
  p_end timestamptz
)
returns table (name text, count bigint)
language sql
stable
security invoker
as $$
  select coalesce(name, 'unknown') as name, count(*) as count
  from public.events
  where site_id = p_site_id
    and type = 'conversion'
    and created_at >= p_start and created_at < p_end
    and site_id in (select public.user_site_ids())
  group by 1
  order by count desc;
$$;

grant execute on function public.copilot_conversions_by_type(uuid, timestamptz, timestamptz) to authenticated;

create or replace function public.copilot_conversions_by_page(
  p_site_id uuid,
  p_start timestamptz,
  p_end timestamptz,
  p_limit int default 10
)
returns table (path text, conversions bigint)
language sql
stable
security invoker
as $$
  select coalesce(path, '/') as path, count(*) as conversions
  from public.events
  where site_id = p_site_id
    and type = 'conversion'
    and created_at >= p_start and created_at < p_end
    and site_id in (select public.user_site_ids())
  group by 1
  order by conversions desc
  limit p_limit;
$$;

grant execute on function public.copilot_conversions_by_page(uuid, timestamptz, timestamptz, int) to authenticated;

create or replace function public.copilot_funnel(
  p_site_id uuid,
  p_start timestamptz,
  p_end timestamptz
)
returns jsonb
language sql
stable
security invoker
as $$
  with base as (
    select
      count(distinct visitor_hash) filter (where type = 'pageview') as visitors,
      count(distinct visitor_hash) filter (where type = 'click') as clickers,
      count(distinct visitor_hash) filter (where type = 'conversion') as converters
    from public.events
    where site_id = p_site_id
      and created_at >= p_start and created_at < p_end
      and site_id in (select public.user_site_ids())
  )
  select jsonb_build_object(
    'visitors', visitors,
    'clickers', clickers,
    'converters', converters,
    'visitor_to_click_pct', case when visitors = 0 then 0
      else round(100.0 * clickers / visitors, 2) end,
    'click_to_conversion_pct', case when clickers = 0 then 0
      else round(100.0 * converters / clickers, 2) end,
    'visitor_to_conversion_pct', case when visitors = 0 then 0
      else round(100.0 * converters / visitors, 2) end
  )
  from base;
$$;

grant execute on function public.copilot_funnel(uuid, timestamptz, timestamptz) to authenticated;

-- ---------------------------------------------------------------------------
-- Site seed AKNO
-- ---------------------------------------------------------------------------

insert into public.sites (public_id, name, domain, url, gsc_property)
values (
  'site_akno',
  'AKNO',
  'akno.fr',
  'https://akno.fr',
  'sc-domain:akno.fr'
)
on conflict (public_id) do update set
  name = excluded.name,
  domain = excluded.domain,
  url = excluded.url,
  gsc_property = excluded.gsc_property;
