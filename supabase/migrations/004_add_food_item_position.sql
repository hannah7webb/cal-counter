alter table public.food_items
  add column if not exists position integer not null default 0;

-- Backfill existing rows with a stable order based on creation time, so
-- current food items keep their existing relative order until reordered.
update public.food_items
set position = sub.rn
from (
  select id, row_number() over (partition by user_id order by created_at) as rn
  from public.food_items
) sub
where public.food_items.id = sub.id;
