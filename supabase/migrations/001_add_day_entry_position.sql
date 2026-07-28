-- Run this once in the Supabase SQL Editor for a project that already has
-- the original schema (from before drag-to-reorder was added).

alter table public.day_entries
  add column if not exists position integer not null default 0;
