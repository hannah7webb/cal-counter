-- Run this once in the Supabase SQL Editor for a project that already has
-- the schema from before the hourly day view was added.
--
-- Existing entries have no time-of-day data, so they all default to the
-- noon (12) hour slot on their existing day. You can drag them to a
-- different hour afterward.

alter table public.day_entries
  add column if not exists hour integer not null default 12;
