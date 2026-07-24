-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- for your project, once, before using the app.

create table if not exists public.food_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null,
  calories numeric not null default 0,
  protein numeric not null default 0,
  fat numeric not null default 0,
  carbs numeric not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.day_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  food_item_id uuid not null references public.food_items (id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  effective_date date not null,
  calories numeric not null default 0,
  protein numeric not null default 0,
  fat numeric not null default 0,
  carbs numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, effective_date)
);

create index if not exists day_entries_user_date_idx on public.day_entries (user_id, date);
create index if not exists food_items_user_idx on public.food_items (user_id);
create index if not exists goals_user_date_idx on public.goals (user_id, effective_date);

alter table public.food_items enable row level security;
alter table public.day_entries enable row level security;
alter table public.goals enable row level security;

create policy "Users manage their own food items"
  on public.food_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own day entries"
  on public.day_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own goals"
  on public.goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
