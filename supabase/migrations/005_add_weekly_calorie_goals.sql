create table if not exists public.weekly_calorie_goals (
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start date not null,
  calorie_goal numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, week_start)
);

alter table public.weekly_calorie_goals enable row level security;

create policy "Users manage their own weekly calorie goals"
  on public.weekly_calorie_goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
