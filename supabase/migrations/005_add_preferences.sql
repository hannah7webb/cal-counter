create table if not exists public.preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  weekly_calorie_goal numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.preferences enable row level security;

create policy "Users manage their own preferences"
  on public.preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
