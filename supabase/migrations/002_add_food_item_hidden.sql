-- Run this once in the Supabase SQL Editor for a project that already has
-- the schema from before hide/unhide was added.

alter table public.food_items
  add column if not exists hidden boolean not null default false;
