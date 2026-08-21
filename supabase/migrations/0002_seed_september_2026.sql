-- ============================================================
-- Authorized seed: September 2026 Wax Ring Workshop sessions
-- (spec §8). Idempotent via the (workshop_type, starts_at)
-- unique index. Mondays + Thursdays, 17:00–20:00 America/Cancun
-- (fixed UTC-5); continuation the following day.
-- ============================================================

insert into workshop_sessions (
  workshop_type, starts_at, ends_at,
  continuation_starts_at, continuation_ends_at,
  instructor, status, standard_capacity, hard_capacity, extra_spot_enabled
)
values
  ('wax_ring', '2026-09-03 17:00:00-05', '2026-09-03 20:00:00-05',
               '2026-09-04 17:00:00-05', '2026-09-04 20:00:00-05',
   'adrian', 'open', 4, 5, false),
  ('wax_ring', '2026-09-07 17:00:00-05', '2026-09-07 20:00:00-05',
               '2026-09-08 17:00:00-05', '2026-09-08 20:00:00-05',
   'adrian', 'open', 4, 5, false),
  ('wax_ring', '2026-09-10 17:00:00-05', '2026-09-10 20:00:00-05',
               '2026-09-11 17:00:00-05', '2026-09-11 20:00:00-05',
   'adrian', 'open', 4, 5, false),
  ('wax_ring', '2026-09-14 17:00:00-05', '2026-09-14 20:00:00-05',
               '2026-09-15 17:00:00-05', '2026-09-15 20:00:00-05',
   'adrian', 'open', 4, 5, false),
  ('wax_ring', '2026-09-17 17:00:00-05', '2026-09-17 20:00:00-05',
               '2026-09-18 17:00:00-05', '2026-09-18 20:00:00-05',
   'adrian', 'open', 4, 5, false),
  ('wax_ring', '2026-09-21 17:00:00-05', '2026-09-21 20:00:00-05',
               '2026-09-22 17:00:00-05', '2026-09-22 20:00:00-05',
   'adrian', 'open', 4, 5, false),
  ('wax_ring', '2026-09-24 17:00:00-05', '2026-09-24 20:00:00-05',
               '2026-09-25 17:00:00-05', '2026-09-25 20:00:00-05',
   'adrian', 'open', 4, 5, false),
  ('wax_ring', '2026-09-28 17:00:00-05', '2026-09-28 20:00:00-05',
               '2026-09-29 17:00:00-05', '2026-09-29 20:00:00-05',
   'adrian', 'open', 4, 5, false)
on conflict (workshop_type, starts_at) do nothing;
