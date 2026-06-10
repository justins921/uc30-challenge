-- ===========================================================================
-- Deal Analyzer → UC30 integration migration (ADDITIVE)
--
-- All tables are prefixed `da_` to avoid colliding with UC30's existing schema.
-- ===========================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- da_properties
-- ---------------------------------------------------------------------------
create table if not exists public.da_properties (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  name           text not null,
  address        text,
  property_type  text not null default 'sfr'
                 check (property_type in ('sfr', 'small_multi', 'large_multi', 'commercial')),
  square_footage integer,
  unit_count     integer,
  year_built     integer,
  archived       boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists da_properties_user_id_idx on public.da_properties (user_id);

-- ---------------------------------------------------------------------------
-- da_checklist_items
-- ---------------------------------------------------------------------------
create table if not exists public.da_checklist_items (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.da_properties (id) on delete cascade,
  section     text not null,
  label       text not null,
  status      text not null default 'not_started'
              check (status in ('not_started', 'in_progress', 'collected', 'na')),
  notes       text,
  critical    boolean not null default false,
  updated_at  timestamptz not null default now()
);
create index if not exists da_checklist_items_property_idx on public.da_checklist_items (property_id);

-- ---------------------------------------------------------------------------
-- da_inspection_systems
-- ---------------------------------------------------------------------------
create table if not exists public.da_inspection_systems (
  id             uuid primary key default gen_random_uuid(),
  property_id    uuid not null references public.da_properties (id) on delete cascade,
  system_key     text not null,
  included       boolean not null default false,
  year_installed integer,
  condition      text default 'good'
                 check (condition in ('excellent', 'good', 'fair', 'poor')),
  quantity       numeric,
  notes          text,
  updated_at     timestamptz not null default now(),
  unique (property_id, system_key)
);
create index if not exists da_inspection_systems_property_idx on public.da_inspection_systems (property_id);

-- ---------------------------------------------------------------------------
-- da_report_shares
-- ---------------------------------------------------------------------------
create table if not exists public.da_report_shares (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.da_properties (id) on delete cascade,
  share_token uuid not null unique default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  expires_at  timestamptz
);
create index if not exists da_report_shares_token_idx on public.da_report_shares (share_token);
create index if not exists da_report_shares_property_idx on public.da_report_shares (property_id);

-- ===========================================================================
-- Triggers — keep updated_at fresh.
-- ===========================================================================
create or replace function public.da_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists da_properties_touch on public.da_properties;
create trigger da_properties_touch
  before update on public.da_properties
  for each row execute function public.da_touch_updated_at();

-- ===========================================================================
-- Row Level Security — scoped to the Supabase Auth user (auth.uid()).
-- ===========================================================================
alter table public.da_properties        enable row level security;
alter table public.da_checklist_items   enable row level security;
alter table public.da_inspection_systems enable row level security;
alter table public.da_report_shares     enable row level security;

drop policy if exists "da_properties_all_own" on public.da_properties;
create policy "da_properties_all_own" on public.da_properties
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "da_checklist_all_own" on public.da_checklist_items;
create policy "da_checklist_all_own" on public.da_checklist_items
  for all
  using (exists (select 1 from public.da_properties p
                 where p.id = da_checklist_items.property_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.da_properties p
                 where p.id = da_checklist_items.property_id and p.user_id = auth.uid()));

drop policy if exists "da_inspection_all_own" on public.da_inspection_systems;
create policy "da_inspection_all_own" on public.da_inspection_systems
  for all
  using (exists (select 1 from public.da_properties p
                 where p.id = da_inspection_systems.property_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.da_properties p
                 where p.id = da_inspection_systems.property_id and p.user_id = auth.uid()));

drop policy if exists "da_shares_all_own" on public.da_report_shares;
create policy "da_shares_all_own" on public.da_report_shares
  for all
  using (exists (select 1 from public.da_properties p
                 where p.id = da_report_shares.property_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.da_properties p
                 where p.id = da_report_shares.property_id and p.user_id = auth.uid()));
