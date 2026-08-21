import { beforeAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import path from "node:path";

/* Runs the REAL migrations inside an in-process Postgres and exercises the
   booking engine: capacity, overbooking, idempotency, fifth seat, cancel,
   move, blocked/past rejection and month generation.
   (pglite is single-connection, so the two-writers race is exercised as its
   serialized equivalent — the row lock in create_booking makes the parallel
   case collapse to exactly this sequence.) */

let db: PGlite;

const sql = async <T = Record<string, unknown>>(query: string, params?: unknown[]) =>
  (await db.query<T>(query, params)).rows;

async function expectSqlState(promise: Promise<unknown>, code: string) {
  try {
    await promise;
  } catch (err) {
    const e = err as { code?: string; message?: string };
    const state = e.code ?? (e.message?.match(/SQLSTATE\s+(\w{5})/) || [])[1];
    if (state) {
      expect(state).toBe(code);
    } else {
      expect(e.message ?? "").toContain(code === "CA001" ? "party too large" : "");
    }
    return err;
  }
  throw new Error(`expected SQLSTATE ${code}, but query succeeded`);
}

interface BookingResult {
  id: string;
  booking_reference: string;
  session_id: string;
  party_size: number;
  remaining_seats: number;
  duplicate: boolean;
}

let sessionSeq = 0;
async function createSession(opts: {
  daysFromNow?: number;
  status?: string;
}): Promise<string> {
  const days = opts.daysFromNow ?? 7;
  // Distinct minute offset per session: consecutive inserts within the same
  // microsecond would otherwise collide on the (workshop_type, starts_at)
  // unique index.
  sessionSeq += 1;
  const rows = await sql<{ id: string }>(
    `insert into workshop_sessions (workshop_type, starts_at, ends_at, status)
     values ('wax_ring', now() + make_interval(days => $1, mins => $3),
             now() + make_interval(days => $1, mins => $3, hours => 3), $2)
     returning id`,
    [days, opts.status ?? "open", sessionSeq]
  );
  return rows[0].id;
}

let seq = 0;
async function book(
  sessionId: string,
  partySize: number,
  key?: string
): Promise<BookingResult> {
  seq += 1;
  const rows = await sql<{ create_booking: BookingResult }>(
    `select create_booking($1, $2, $3, $4, $5, 'brass', null, $6, 'website', null) as create_booking`,
    [
      sessionId,
      `Test Person ${seq}`,
      `person${seq}@example.com`,
      "+525500000000",
      partySize,
      key ?? `key-${seq}-${Math.random().toString(36).slice(2)}`,
    ]
  );
  return rows[0].create_booking;
}

async function available(sessionId: string): Promise<number> {
  const rows = await sql<{ available_seats: number }>(
    `select available_seats from get_public_sessions() where id = $1`,
    [sessionId]
  );
  return rows[0]?.available_seats ?? -1;
}

beforeAll(async () => {
  db = new PGlite();
  // Roles referenced by the migration's grants exist on Supabase; create here.
  await db.exec(`create role anon; create role authenticated; create role service_role;`);
  const dir = path.resolve(__dirname, "../supabase/migrations");
  await db.exec(readFileSync(path.join(dir, "0001_workshops.sql"), "utf8"));
  await db.exec(readFileSync(path.join(dir, "0002_seed_september_2026.sql"), "utf8"));
}, 60000);

describe("september 2026 seed", () => {
  it("is idempotent — running the seed again adds nothing", async () => {
    const dir = path.resolve(__dirname, "../supabase/migrations");
    await db.exec(readFileSync(path.join(dir, "0002_seed_september_2026.sql"), "utf8"));
    const rows = await sql<{ n: number }>(
      `select count(*)::int as n from workshop_sessions
       where starts_at >= '2026-09-01T00:00:00Z' and starts_at < '2026-10-01T00:00:00Z'`
    );
    expect(rows[0].n).toBe(8);
  });

  it("seeds Adrián, capacity 4/5, fifth seat closed, open", async () => {
    const rows = await sql<{
      instructor: string;
      status: string;
      standard_capacity: number;
      hard_capacity: number;
      extra_spot_enabled: boolean;
    }>(
      `select distinct instructor, status, standard_capacity, hard_capacity, extra_spot_enabled
       from workshop_sessions
       where starts_at >= '2026-09-01T00:00:00Z' and starts_at < '2026-10-01T00:00:00Z'`
    );
    expect(rows).toEqual([
      {
        instructor: "adrian",
        status: "open",
        standard_capacity: 4,
        hard_capacity: 5,
        extra_spot_enabled: false,
      },
    ]);
  });
});

describe("create_booking — capacity and overbooking", () => {
  it("fills four seats and then sells out (never 5/4)", async () => {
    const s = await createSession({});
    expect(await available(s)).toBe(4);
    await book(s, 2);
    await book(s, 2);
    expect(await available(s)).toBe(0);
    await expectSqlState(book(s, 1), "CA002");
    const confirmed = await sql<{ n: number }>(
      `select coalesce(sum(party_size),0)::int as n from workshop_bookings
       where session_id = $1 and status = 'confirmed'`,
      [s]
    );
    expect(confirmed[0].n).toBe(4);
  });

  it("rejects a party larger than the remaining seats with the remaining count", async () => {
    const s = await createSession({});
    await book(s, 3);
    const err = (await expectSqlState(book(s, 2), "CA001")) as { message: string };
    expect(err.message).toContain("remaining=1");
    expect(await available(s)).toBe(1);
  });

  it("serialized final-seat race: first commits, second is rejected", async () => {
    const s = await createSession({});
    await book(s, 3);
    const a = await book(s, 1, "race-key-A");
    expect(a.remaining_seats).toBe(0);
    await expectSqlState(book(s, 1, "race-key-B"), "CA002");
  });

  it("is idempotent — the same key returns the same booking without consuming seats", async () => {
    const s = await createSession({});
    const first = await book(s, 2, "same-key-123456");
    seq -= 1; // same "customer" retries
    const retry = await book(s, 2, "same-key-123456");
    expect(retry.booking_reference).toBe(first.booking_reference);
    expect(retry.duplicate).toBe(true);
    expect(await available(s)).toBe(2);
  });

  it("identical retry against a now-full session returns the winner, not sold-out", async () => {
    const s = await createSession({});
    await book(s, 3);
    const winner = await book(s, 1, "retry-under-lock-key");
    // The transport retries the same request after the session filled up.
    seq -= 1;
    const retry = await book(s, 1, "retry-under-lock-key");
    expect(retry.duplicate).toBe(true);
    expect(retry.booking_reference).toBe(winner.booking_reference);
    const confirmed = await sql<{ n: number }>(
      `select coalesce(sum(party_size),0)::int as n from workshop_bookings
       where session_id = $1 and status = 'confirmed'`,
      [s]
    );
    expect(confirmed[0].n).toBe(4); // no extra seat consumed, no CA002
  });

  it("in-progress sessions are hidden from the public projection", async () => {
    const rows = await sql<{ id: string }>(
      `insert into workshop_sessions (workshop_type, starts_at, ends_at, status)
       values ('wax_ring', now() - interval '1 hour', now() + interval '2 hours', 'open')
       returning id`
    );
    expect(await available(rows[0].id)).toBe(-1); // absent: not bookable, not advertised
  });

  it("rejects blocked and past sessions", async () => {
    const blocked = await createSession({ status: "blocked" });
    await expectSqlState(book(blocked, 1), "CA003");
    const past = await createSession({ daysFromNow: -1 });
    await expectSqlState(book(past, 1), "CA004");
  });

  it("generates unique CTR-WRK references", async () => {
    const s = await createSession({});
    const b1 = await book(s, 1);
    const b2 = await book(s, 1);
    expect(b1.booking_reference).toMatch(/^CTR-WRK-\d{6}-[A-Z2-9]{4}$/);
    expect(b2.booking_reference).toMatch(/^CTR-WRK-\d{6}-[A-Z2-9]{4}$/);
    expect(b1.booking_reference).not.toBe(b2.booking_reference);
  });

  it("stamps the reference with the session's LOCAL date (evening sessions)", async () => {
    const rows = await sql<{ id: string }>(
      `select id from workshop_sessions where starts_at = '2026-09-03 17:00:00-05'`
    );
    const b = await book(rows[0].id, 1);
    expect(b.booking_reference).toMatch(/^CTR-WRK-260903-/);
  });
});

describe("fifth seat", () => {
  it("opens manually, accepts a fifth guest, and refuses to close over five", async () => {
    const s = await createSession({});
    await book(s, 4);
    await expectSqlState(book(s, 1), "CA002"); // closed by default
    await sql(`select set_extra_spot($1, true)`, [s]);
    expect(await available(s)).toBe(1);
    await book(s, 1);
    await expectSqlState(sql(`select set_extra_spot($1, false)`, [s]), "CA006");
  });

  it("can close again when only four are confirmed", async () => {
    const s = await createSession({});
    await book(s, 4);
    await sql(`select set_extra_spot($1, true)`, [s]);
    await sql(`select set_extra_spot($1, false)`, [s]);
    expect(await available(s)).toBe(0);
  });
});

describe("cancel and move", () => {
  it("cancelling restores availability and preserves history", async () => {
    const s = await createSession({});
    const b = await book(s, 4);
    expect(await available(s)).toBe(0);
    await sql(`select cancel_booking($1)`, [b.id]);
    expect(await available(s)).toBe(4);
    const rows = await sql<{ status: string }>(
      `select status from workshop_bookings where id = $1`,
      [b.id]
    );
    expect(rows[0].status).toBe("cancelled"); // soft delete only
    await book(s, 4); // seats truly restored
  });

  it("moving validates target capacity atomically", async () => {
    const from = await createSession({});
    const full = await createSession({});
    await book(full, 4);
    const b = await book(from, 2);
    await expectSqlState(
      sql(`select move_booking($1, $2)`, [b.id, full]),
      "CA001"
    );
    const target = await createSession({});
    await sql(`select move_booking($1, $2)`, [b.id, target]);
    expect(await available(from)).toBe(4);
    expect(await available(target)).toBe(2);
  });

  it("refuses to move a booking onto a session that already started", async () => {
    const from = await createSession({});
    const b = await book(from, 1);
    const past = await createSession({ daysFromNow: -1 });
    await expectSqlState(sql(`select move_booking($1, $2)`, [b.id, past]), "CA004");
  });
});

describe("admin session changes", () => {
  it("changing the instructor preserves reservations and capacity", async () => {
    const s = await createSession({});
    await book(s, 3);
    await sql(`update workshop_sessions set instructor = 'emilio' where id = $1`, [s]);
    expect(await available(s)).toBe(1);
    const rows = await sql<{ n: number }>(
      `select count(*)::int as n from workshop_bookings where session_id = $1 and status='confirmed'`,
      [s]
    );
    expect(rows[0].n).toBe(1);
  });

  it("blocked sessions disappear from the public projection", async () => {
    const s = await createSession({});
    expect(await available(s)).toBe(4);
    await sql(`update workshop_sessions set status = 'blocked' where id = $1`, [s]);
    expect(await available(s)).toBe(-1); // helper returns -1 when absent
  });
});

describe("generate_month", () => {
  it("creates only Mon/Thu 17:00-05 sessions and is idempotent", async () => {
    const first = await sql<{ generate_month: { created: number; skipped: number } }>(
      `select generate_month(2026, 11) as generate_month`
    );
    expect(first[0].generate_month.created).toBeGreaterThan(0);
    const second = await sql<{ generate_month: { created: number; skipped: number } }>(
      `select generate_month(2026, 11) as generate_month`
    );
    expect(second[0].generate_month.created).toBe(0);
    expect(second[0].generate_month.skipped).toBe(first[0].generate_month.created);

    const rows = await sql<{ dow: number; hour: number }>(
      `select extract(isodow from starts_at at time zone interval '-05:00')::int as dow,
              extract(hour from starts_at at time zone interval '-05:00')::int as hour
       from workshop_sessions
       where starts_at >= '2026-11-01T00:00:00Z' and starts_at < '2026-12-01T00:00:00Z'`
    );
    expect(rows.length).toBe(first[0].generate_month.created);
    for (const r of rows) {
      expect([1, 4]).toContain(r.dow);
      expect(r.hour).toBe(17);
    }
  });
});

describe("security posture", () => {
  it("row level security is enabled on both tables", async () => {
    const rows = await sql<{ relname: string; relrowsecurity: boolean }>(
      `select relname, relrowsecurity from pg_class
       where relname in ('workshop_sessions', 'workshop_bookings')`
    );
    expect(rows).toHaveLength(2);
    for (const r of rows) expect(r.relrowsecurity).toBe(true);
  });

  it("no permissive policies exist for public roles (deny-all)", async () => {
    const rows = await sql<{ n: number }>(
      `select count(*)::int as n from pg_policies
       where tablename in ('workshop_sessions', 'workshop_bookings')`
    );
    expect(rows[0].n).toBe(0);
  });
});
