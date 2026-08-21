-- ============================================================
-- CONTRASTE ATELIER — Workshop booking schema (V1)
-- Source of truth for sessions, capacity and reservations.
-- America/Cancun is fixed UTC-5 (no DST); local times use -05:00.
-- ============================================================

-- ── Tables ──────────────────────────────────────────────────

create table if not exists workshop_sessions (
  id                      uuid primary key default gen_random_uuid(),
  workshop_type           text not null default 'wax_ring'
                            check (workshop_type in ('wax_ring')),
  starts_at               timestamptz not null,
  ends_at                 timestamptz not null,
  continuation_starts_at  timestamptz,
  continuation_ends_at    timestamptz,
  instructor              text not null default 'adrian'
                            check (instructor in ('adrian', 'emilio')),
  status                  text not null default 'open'
                            check (status in ('open', 'blocked', 'cancelled')),
  standard_capacity       int not null default 4 check (standard_capacity >= 1),
  hard_capacity           int not null default 5,
  extra_spot_enabled      boolean not null default false,
  internal_notes          text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  check (hard_capacity >= standard_capacity),
  check (ends_at > starts_at)
);

-- Idempotent seeding / month generation.
create unique index if not exists workshop_sessions_type_start_key
  on workshop_sessions (workshop_type, starts_at);

create table if not exists workshop_bookings (
  id                          uuid primary key default gen_random_uuid(),
  booking_reference           text not null unique,
  idempotency_key             text not null unique,
  session_id                  uuid not null references workshop_sessions(id),
  customer_name               text not null,
  email                       text not null,
  phone                       text not null,
  party_size                  int not null check (party_size >= 1 and party_size <= 5),
  metal_preference            text not null default 'undecided'
                                check (metal_preference in
                                  ('brass', 'silver_quote', 'gold_quote', 'undecided')),
  customer_notes              text,
  continuation_needed         boolean not null default false,
  status                      text not null default 'confirmed'
                                check (status in ('confirmed','cancelled','completed','no_show')),
  source                      text not null default 'website'
                                check (source in ('website', 'admin')),
  utm                         jsonb,
  confirmation_email_status   text,
  confirmation_email_sent_at  timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists workshop_bookings_session_idx
  on workshop_bookings (session_id, status);

-- ── updated_at maintenance ──────────────────────────────────

create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists workshop_sessions_touch on workshop_sessions;
create trigger workshop_sessions_touch
  before update on workshop_sessions
  for each row execute function set_updated_at();

drop trigger if exists workshop_bookings_touch on workshop_bookings;
create trigger workshop_bookings_touch
  before update on workshop_bookings
  for each row execute function set_updated_at();

-- ── Row Level Security: deny-all for public roles ───────────
-- Public access happens exclusively through SECURITY DEFINER
-- functions with a safe projection. Service role bypasses RLS.

alter table workshop_sessions enable row level security;
alter table workshop_bookings enable row level security;

revoke all on workshop_sessions from anon, authenticated;
revoke all on workshop_bookings from anon, authenticated;

-- ── Availability helpers ────────────────────────────────────

create or replace function session_confirmed_seats(p_session_id uuid)
returns int
language sql
stable
as $$
  select coalesce(sum(party_size), 0)::int
  from workshop_bookings
  where session_id = p_session_id and status = 'confirmed';
$$;

create or replace function session_effective_capacity(p_session workshop_sessions)
returns int
language sql
immutable
as $$
  select case when p_session.extra_spot_enabled
              then p_session.hard_capacity
              else p_session.standard_capacity end;
$$;

-- ── Public projection (no PII, no internal notes) ───────────

create or replace function get_public_sessions()
returns table (
  id uuid,
  starts_at timestamptz,
  ends_at timestamptz,
  available_seats int,
  effective_capacity int
)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.id,
    s.starts_at,
    s.ends_at,
    greatest(0, session_effective_capacity(s) - session_confirmed_seats(s.id)) as available_seats,
    session_effective_capacity(s) as effective_capacity
  from workshop_sessions s
  where s.status = 'open'
    and s.starts_at > now() -- in-progress sessions are not bookable, so never advertised
  order by s.starts_at asc;
$$;

revoke all on function get_public_sessions() from public;
grant execute on function get_public_sessions() to anon, authenticated, service_role;

-- Internal helpers must not be reachable through PostgREST rpc.
revoke all on function session_confirmed_seats(uuid) from public, anon, authenticated;
revoke all on function session_effective_capacity(workshop_sessions) from public, anon, authenticated;

-- ── Realtime availability broadcast ─────────────────────────
-- Sends the recomputed public state of one session on the
-- 'workshop_sessions_public' topic. Guarded so environments
-- without the realtime extension (local tests) still work.

create or replace function broadcast_session_availability(p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session workshop_sessions;
  v_available int;
begin
  select * into v_session from workshop_sessions where id = p_session_id;
  if not found then return; end if;
  v_available := greatest(0, session_effective_capacity(v_session) - session_confirmed_seats(v_session.id));
  begin
    perform realtime.send(
      jsonb_build_object(
        'session_id', v_session.id,
        'status', v_session.status,
        'available_seats', v_available,
        'effective_capacity', session_effective_capacity(v_session)
      ),
      'availability',
      'workshop_sessions_public',
      false
    );
  exception when undefined_function or invalid_schema_name then
    null; -- realtime not installed (tests / local pg)
  end;
end $$;

-- SECURITY DEFINER + default PUBLIC execute would let anon bypass the public
-- projection (broadcast blocked/past session state) and flood the realtime
-- topic. Internal only: triggers and RPCs run as the function owner.
revoke all on function broadcast_session_availability(uuid) from public, anon, authenticated;
grant execute on function broadcast_session_availability(uuid) to service_role;

create or replace function bookings_broadcast_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform broadcast_session_availability(coalesce(new.session_id, old.session_id));
  if tg_op = 'UPDATE' and new.session_id is distinct from old.session_id then
    perform broadcast_session_availability(old.session_id);
  end if;
  return coalesce(new, old);
end $$;

drop trigger if exists workshop_bookings_broadcast on workshop_bookings;
create trigger workshop_bookings_broadcast
  after insert or update or delete on workshop_bookings
  for each row execute function bookings_broadcast_trigger();

create or replace function sessions_broadcast_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform broadcast_session_availability(new.id);
  return new;
end $$;

drop trigger if exists workshop_sessions_broadcast on workshop_sessions;
create trigger workshop_sessions_broadcast
  after update on workshop_sessions
  for each row execute function sessions_broadcast_trigger();

-- ── Booking reference generator ─────────────────────────────
-- CTR-WRK-YYMMDD-XXXX, unambiguous alphabet, unique.

create or replace function generate_booking_reference(p_starts_at timestamptz)
returns text
language plpgsql
volatile
as $$
declare
  v_alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_date text;
  v_suffix text;
  v_ref text;
  v_tries int := 0;
begin
  -- interval form: bare '-05:00' strings use inverted POSIX sign semantics
  v_date := to_char(p_starts_at at time zone interval '-05:00', 'YYMMDD');
  loop
    v_suffix := '';
    for i in 1..4 loop
      v_suffix := v_suffix ||
        substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
    end loop;
    v_ref := 'CTR-WRK-' || v_date || '-' || v_suffix;
    exit when not exists (select 1 from workshop_bookings where booking_reference = v_ref);
    v_tries := v_tries + 1;
    if v_tries > 50 then
      raise exception 'could not generate unique booking reference';
    end if;
  end loop;
  return v_ref;
end $$;

revoke all on function generate_booking_reference(timestamptz) from public, anon, authenticated;

-- ── create_booking: atomic, idempotent, overbooking-proof ───
-- Custom SQLSTATEs consumed by the app layer:
--   CA001 party too large (message carries remaining=N)
--   CA002 sold out
--   CA003 session not open (blocked/cancelled)
--   CA004 session in the past
--   CA005 invalid input

create or replace function create_booking(
  p_session_id uuid,
  p_customer_name text,
  p_email text,
  p_phone text,
  p_party_size int,
  p_metal_preference text,
  p_customer_notes text,
  p_idempotency_key text,
  p_source text default 'website',
  p_utm jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session workshop_sessions;
  v_existing workshop_bookings;
  v_capacity int;
  v_confirmed int;
  v_remaining int;
  v_booking workshop_bookings;
begin
  if p_party_size is null or p_party_size < 1 or p_party_size > 5 then
    raise exception 'invalid party size' using errcode = 'CA005';
  end if;
  if coalesce(trim(p_customer_name), '') = '' or coalesce(trim(p_email), '') = '' then
    raise exception 'missing customer data' using errcode = 'CA005';
  end if;
  if p_idempotency_key is null or length(p_idempotency_key) < 8 then
    raise exception 'missing idempotency key' using errcode = 'CA005';
  end if;

  -- Idempotency: same key → same booking, no duplicate seat consumption.
  select * into v_existing from workshop_bookings
    where idempotency_key = p_idempotency_key;
  if found then
    select * into v_session from workshop_sessions where id = v_existing.session_id;
    return jsonb_build_object(
      'id', v_existing.id,
      'booking_reference', v_existing.booking_reference,
      'session_id', v_existing.session_id,
      'starts_at', v_session.starts_at,
      'ends_at', v_session.ends_at,
      'party_size', v_existing.party_size,
      'metal_preference', v_existing.metal_preference,
      'remaining_seats', greatest(0, session_effective_capacity(v_session) - session_confirmed_seats(v_session.id)),
      'duplicate', true
    );
  end if;

  -- Serialize seat accounting on this session.
  select * into v_session from workshop_sessions
    where id = p_session_id
    for update;
  if not found then
    raise exception 'session not found' using errcode = 'CA003';
  end if;
  if v_session.status <> 'open' then
    raise exception 'session not open' using errcode = 'CA003';
  end if;
  if v_session.starts_at <= now() then
    raise exception 'session already started' using errcode = 'CA004';
  end if;

  -- Re-check idempotency under the lock: an identical concurrent retry may
  -- have committed while we waited, and must get its booking back — not a
  -- spurious sold-out that pushes the customer into double-booking.
  select * into v_existing from workshop_bookings
    where idempotency_key = p_idempotency_key;
  if found then
    return jsonb_build_object(
      'id', v_existing.id,
      'booking_reference', v_existing.booking_reference,
      'session_id', v_existing.session_id,
      'starts_at', v_session.starts_at,
      'ends_at', v_session.ends_at,
      'party_size', v_existing.party_size,
      'metal_preference', v_existing.metal_preference,
      'remaining_seats', greatest(0, session_effective_capacity(v_session) - session_confirmed_seats(v_session.id)),
      'duplicate', true
    );
  end if;

  v_capacity := session_effective_capacity(v_session);
  v_confirmed := session_confirmed_seats(v_session.id);
  v_remaining := greatest(0, v_capacity - v_confirmed);

  if v_remaining <= 0 then
    raise exception 'sold out' using errcode = 'CA002';
  end if;
  if p_party_size > v_remaining then
    raise exception 'party too large remaining=%', v_remaining using errcode = 'CA001';
  end if;

  insert into workshop_bookings (
    booking_reference, idempotency_key, session_id,
    customer_name, email, phone, party_size,
    metal_preference, customer_notes, status, source, utm
  ) values (
    generate_booking_reference(v_session.starts_at),
    p_idempotency_key, p_session_id,
    trim(p_customer_name), lower(trim(p_email)), trim(p_phone), p_party_size,
    coalesce(p_metal_preference, 'undecided'), nullif(trim(coalesce(p_customer_notes, '')), ''),
    'confirmed', coalesce(p_source, 'website'), p_utm
  )
  on conflict (idempotency_key) do nothing
  returning * into v_booking;

  if v_booking.id is null then
    -- Raced against an identical retry: return the winner.
    select * into v_booking from workshop_bookings where idempotency_key = p_idempotency_key;
  end if;

  return jsonb_build_object(
    'id', v_booking.id,
    'booking_reference', v_booking.booking_reference,
    'session_id', v_booking.session_id,
    'starts_at', v_session.starts_at,
    'ends_at', v_session.ends_at,
    'party_size', v_booking.party_size,
    'metal_preference', v_booking.metal_preference,
    'remaining_seats', greatest(0, v_capacity - session_confirmed_seats(v_session.id)),
    'duplicate', false
  );
end $$;

-- Bookings are created only through the server (service role).
revoke all on function create_booking(uuid,text,text,text,int,text,text,text,text,jsonb) from public, anon, authenticated;
grant execute on function create_booking(uuid,text,text,text,int,text,text,text,text,jsonb) to service_role;

-- ── cancel_booking ──────────────────────────────────────────
-- Soft cancel: history is preserved, availability restored.

create or replace function cancel_booking(p_booking_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking workshop_bookings;
begin
  select b.* into v_booking
  from workshop_bookings b
  join workshop_sessions s on s.id = b.session_id
  where b.id = p_booking_id
  for update of b, s;
  if not found then
    raise exception 'booking not found' using errcode = 'CA005';
  end if;
  if v_booking.status = 'cancelled' then
    return jsonb_build_object('id', v_booking.id, 'status', 'cancelled', 'already', true);
  end if;
  update workshop_bookings set status = 'cancelled' where id = p_booking_id
    returning * into v_booking;
  return jsonb_build_object('id', v_booking.id, 'status', v_booking.status, 'already', false);
end $$;

revoke all on function cancel_booking(uuid) from public, anon, authenticated;
grant execute on function cancel_booking(uuid) to service_role;

-- ── move_booking: atomic against target capacity ────────────

create or replace function move_booking(p_booking_id uuid, p_target_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking workshop_bookings;
  v_target workshop_sessions;
  v_first uuid;
  v_second uuid;
  v_capacity int;
  v_remaining int;
begin
  select * into v_booking from workshop_bookings where id = p_booking_id for update;
  if not found then
    raise exception 'booking not found' using errcode = 'CA005';
  end if;
  if v_booking.status <> 'confirmed' then
    raise exception 'only confirmed bookings can move' using errcode = 'CA005';
  end if;
  if v_booking.session_id = p_target_session_id then
    return jsonb_build_object('id', v_booking.id, 'session_id', v_booking.session_id, 'moved', false);
  end if;

  -- Lock both sessions in a stable order to avoid deadlocks.
  if v_booking.session_id < p_target_session_id then
    v_first := v_booking.session_id; v_second := p_target_session_id;
  else
    v_first := p_target_session_id; v_second := v_booking.session_id;
  end if;
  perform 1 from workshop_sessions where id = v_first for update;
  perform 1 from workshop_sessions where id = v_second for update;

  select * into v_target from workshop_sessions where id = p_target_session_id;
  if not found then
    raise exception 'target session not found' using errcode = 'CA003';
  end if;
  if v_target.status <> 'open' then
    raise exception 'target session not open' using errcode = 'CA003';
  end if;
  if v_target.starts_at <= now() then
    raise exception 'target session already started' using errcode = 'CA004';
  end if;

  v_capacity := session_effective_capacity(v_target);
  v_remaining := greatest(0, v_capacity - session_confirmed_seats(v_target.id));
  if v_booking.party_size > v_remaining then
    raise exception 'party too large remaining=%', v_remaining using errcode = 'CA001';
  end if;

  update workshop_bookings set session_id = p_target_session_id
    where id = p_booking_id
    returning * into v_booking;

  perform broadcast_session_availability(v_first);
  perform broadcast_session_availability(v_second);

  return jsonb_build_object('id', v_booking.id, 'session_id', v_booking.session_id, 'moved', true);
end $$;

revoke all on function move_booking(uuid, uuid) from public, anon, authenticated;
grant execute on function move_booking(uuid, uuid) to service_role;

-- ── Admin: fifth seat ───────────────────────────────────────
-- Never opened automatically; cannot close under five confirmed.

create or replace function set_extra_spot(p_session_id uuid, p_enabled boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session workshop_sessions;
  v_confirmed int;
begin
  select * into v_session from workshop_sessions where id = p_session_id for update;
  if not found then
    raise exception 'session not found' using errcode = 'CA003';
  end if;
  v_confirmed := session_confirmed_seats(p_session_id);
  if not p_enabled and v_confirmed > v_session.standard_capacity then
    raise exception 'cannot close fifth spot with % confirmed', v_confirmed using errcode = 'CA006';
  end if;
  update workshop_sessions set extra_spot_enabled = p_enabled where id = p_session_id;
  return jsonb_build_object('id', p_session_id, 'extra_spot_enabled', p_enabled);
end $$;

revoke all on function set_extra_spot(uuid, boolean) from public, anon, authenticated;
grant execute on function set_extra_spot(uuid, boolean) to service_role;

-- ── Admin: month generation (Mon + Thu, 17:00–20:00 -05) ────
-- Idempotent: existing sessions at the same start are skipped.

create or replace function generate_month(p_year int, p_month int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day date;
  v_last date;
  v_dow int;
  v_created int := 0;
  v_skipped int := 0;
  v_dates text[] := '{}';
begin
  if p_year < 2024 or p_year > 2100 or p_month < 1 or p_month > 12 then
    raise exception 'invalid month' using errcode = 'CA005';
  end if;
  v_day := make_date(p_year, p_month, 1);
  v_last := (v_day + interval '1 month' - interval '1 day')::date;
  while v_day <= v_last loop
    v_dow := extract(isodow from v_day); -- 1=Mon .. 7=Sun
    if v_dow in (1, 4) then
      begin
        insert into workshop_sessions (
          workshop_type, starts_at, ends_at,
          continuation_starts_at, continuation_ends_at,
          instructor, status, standard_capacity, hard_capacity, extra_spot_enabled
        ) values (
          'wax_ring',
          make_timestamptz(p_year, p_month, extract(day from v_day)::int, 17, 0, 0, '-05:00'),
          make_timestamptz(p_year, p_month, extract(day from v_day)::int, 20, 0, 0, '-05:00'),
          make_timestamptz(
            extract(year from v_day + 1)::int,
            extract(month from v_day + 1)::int,
            extract(day from v_day + 1)::int, 17, 0, 0, '-05:00'),
          make_timestamptz(
            extract(year from v_day + 1)::int,
            extract(month from v_day + 1)::int,
            extract(day from v_day + 1)::int, 20, 0, 0, '-05:00'),
          'adrian', 'open', 4, 5, false
        );
        v_created := v_created + 1;
        v_dates := v_dates || v_day::text;
      exception when unique_violation then
        v_skipped := v_skipped + 1;
      end;
    end if;
    v_day := v_day + 1;
  end loop;
  return jsonb_build_object('created', v_created, 'skipped', v_skipped, 'dates', v_dates);
end $$;

revoke all on function generate_month(int, int) from public, anon, authenticated;
grant execute on function generate_month(int, int) to service_role;
