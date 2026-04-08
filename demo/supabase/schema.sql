create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  grade text not null,
  gym_name text not null,
  notes text default '',
  created_at timestamptz not null default now()
);

alter table public.routes enable row level security;

drop policy if exists "routes_select_own" on public.routes;
create policy "routes_select_own"
on public.routes
for select
using (auth.uid() = user_id);

drop policy if exists "routes_insert_own" on public.routes;
create policy "routes_insert_own"
on public.routes
for insert
with check (auth.uid() = user_id);

drop policy if exists "routes_delete_own" on public.routes;
create policy "routes_delete_own"
on public.routes
for delete
using (auth.uid() = user_id);
