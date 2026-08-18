"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { INSTRUCTOR_DISPLAY, generateMonthlySessions, type Instructor } from "@/lib/workshops/domain";
import type { AdminBooking, AdminSession } from "@/lib/workshops/admin-api";
import { supabaseBrowser } from "@/lib/supabase/client";

/* Private operations console for workshop sessions. Spartan by design:
   month list → session detail → booking actions. */

const TZ = "America/Cancun";

function fmtRow(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    weekday: "short",
    timeZone: TZ,
  })
    .format(new Date(iso))
    .toUpperCase();
}
function fmtTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
    timeZone: TZ,
  }).format(new Date(iso));
}

type ActionBody = Record<string, unknown> & { action: string };

export function AdminWorkshops({ adminEmail }: { adminEmail: string }) {
  const now = new Date();
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth() + 1);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showManual, setShowManual] = useState<string | null>(null);
  const [genPreview, setGenPreview] = useState<string[] | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const res = await fetch(`/api/admin/data?year=${year}&month=${month}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      setErr(res.status === 401 ? "Session expired — reload to sign in." : "Could not load data.");
      return;
    }
    const data = await res.json();
    setSessions(data.sessions);
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  const act = useCallback(
    async (body: ActionBody, okMsg?: string): Promise<boolean> => {
      setBusy(true);
      setErr(null);
      setMsg(null);
      try {
        const res = await fetch("/api/admin/actions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const map: Record<string, string> = {
            five_confirmed: "Cannot close the 5th spot — five people are confirmed.",
            target_full: `Target session doesn't have enough seats${data.remaining !== undefined ? ` (remaining ${data.remaining})` : ""}.`,
            target_unavailable: "Target session is not open.",
            party_too_large: `Not enough seats${data.remaining !== undefined ? ` (remaining ${data.remaining})` : ""}.`,
            sold_out: "Session is sold out.",
            unavailable: "Session is not open or already started.",
            unauthorized: "Session expired — reload to sign in.",
          };
          setErr(map[data.error] ?? "Action failed.");
          return false;
        }
        if (okMsg) setMsg(okMsg);
        await load();
        return true;
      } catch {
        setErr("Network error.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [load]
  );

  const signOut = async () => {
    await supabaseBrowser()?.auth.signOut();
    window.location.reload();
  };

  /* Weekly summary from loaded month (upcoming sessions only). */
  const summary = useMemo(() => {
    const nowMs = Date.now();
    const week = sessions.filter((s) => {
      const t = new Date(s.starts_at).getTime();
      return t > nowMs && t < nowMs + 7 * 86400_000 && s.status === "open";
    });
    const guests = week.reduce((sum, s) => sum + s.confirmed_seats, 0);
    const cap = (s: AdminSession) =>
      s.extra_spot_enabled ? s.hard_capacity : s.standard_capacity;
    const seats = week.reduce((sum, s) => sum + Math.max(0, cap(s) - s.confirmed_seats), 0);
    const almostFull = week.filter((s) => cap(s) - s.confirmed_seats === 1).length;
    return { workshops: week.length, guests, seats, almostFull };
  }, [sessions]);

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(new Date(Date.UTC(year, month - 1, 1)))
    .toUpperCase();

  const shift = (d: number) => {
    let m = month + d;
    let y = year;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setMonth(m);
    setYear(y);
    setOpenId(null);
    setGenPreview(null);
  };

  const openGenPreview = () => {
    setGenPreview(generateMonthlySessions(year, month).map((g) => g.date));
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <div className="adm__head">
        <div>
          <h1>Workshops</h1>
          <span className="adm__sub">{adminEmail}</span>
        </div>
        <button className="adm__btn" onClick={signOut}>Sign out</button>
      </div>

      <div className="adm__summary">
        <div className="adm__stat"><span className="n">{summary.workshops}</span><span className="l">workshops this week</span></div>
        <div className="adm__stat"><span className="n">{summary.guests}</span><span className="l">confirmed guests</span></div>
        <div className="adm__stat"><span className="n">{summary.seats}</span><span className="l">seats available</span></div>
        <div className="adm__stat"><span className="n">{summary.almostFull}</span><span className="l">almost full</span></div>
      </div>

      <div className="adm__toolbar">
        <button className="adm__nav" onClick={() => shift(-1)} aria-label="Previous month">←</button>
        <span className="adm__month">{monthLabel}</span>
        <button className="adm__nav" onClick={() => shift(1)} aria-label="Next month">→</button>
        <span style={{ flex: 1 }} />
        <button className="adm__btn" onClick={openGenPreview} disabled={busy}>
          Generate {monthLabel}
        </button>
      </div>

      {genPreview && (
        <div className="adm__detail">
          <span className="adm__sub">
            Generate Mon+Thu sessions · 17:00–20:00 · Adrián · 4 (+1 manual) —{" "}
            existing dates are skipped.
          </span>
          <p style={{ margin: "12px 0", fontFamily: "var(--mono)", fontSize: 12 }}>
            {genPreview.length ? genPreview.join(" · ") : "No Mon/Thu dates in this month."}
          </p>
          <div className="adm__actions">
            <button
              className="adm__btn"
              disabled={busy || !genPreview.length}
              onClick={async () => {
                const ok = await act(
                  { action: "generate_month", year, month },
                  "Month generated."
                );
                if (ok) setGenPreview(null);
              }}
            >
              Confirm generate
            </button>
            <button className="adm__btn" onClick={() => setGenPreview(null)}>Cancel</button>
          </div>
        </div>
      )}

      {err && <p className="adm__msg adm__msg--err">{err}</p>}
      {msg && <p className="adm__msg">{msg}</p>}

      <ul className="adm__list">
        {sessions.length === 0 && (
          <li className="adm__msg" style={{ padding: "18px 4px" }}>
            No sessions in this month.
          </li>
        )}
        {sessions.map((s) => {
          const cap = s.extra_spot_enabled ? s.hard_capacity : s.standard_capacity;
          const remaining = Math.max(0, cap - s.confirmed_seats);
          return (
            <li key={s.id}>
              <button
                type="button"
                className="adm__row"
                onClick={() => setOpenId(openId === s.id ? null : s.id)}
                aria-expanded={openId === s.id}
              >
                <span className="date">{fmtRow(s.starts_at)}<br />{fmtTime(s.starts_at)}</span>
                <span>{INSTRUCTOR_DISPLAY[s.instructor]}{s.extra_spot_enabled ? " · 5th open" : ""}</span>
                <span className="cap">{s.confirmed_seats} / {cap}</span>
                <span>
                  {s.status === "blocked" ? (
                    <span className="adm__badge adm__badge--blocked">Blocked</span>
                  ) : remaining === 0 ? (
                    <span className="adm__badge adm__badge--full">Sold out</span>
                  ) : remaining === 1 ? (
                    <span className="adm__badge adm__badge--warn">Last spot</span>
                  ) : (
                    <span className="adm__badge">{remaining} open</span>
                  )}
                </span>
              </button>
              {openId === s.id && (
                <SessionDetail
                  session={s}
                  sessions={sessions}
                  busy={busy}
                  act={act}
                  showManual={showManual === s.id}
                  toggleManual={() => setShowManual(showManual === s.id ? null : s.id)}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SessionDetail({
  session: s,
  sessions,
  busy,
  act,
  showManual,
  toggleManual,
}: {
  session: AdminSession;
  sessions: AdminSession[];
  busy: boolean;
  act: (body: ActionBody, okMsg?: string) => Promise<boolean>;
  showManual: boolean;
  toggleManual: () => void;
}) {
  const cap = s.extra_spot_enabled ? s.hard_capacity : s.standard_capacity;
  const confirmed = s.bookings.filter((b) => b.status === "confirmed");
  const otherInstructor: Instructor = s.instructor === "adrian" ? "emilio" : "adrian";

  const onBlock = async () => {
    if (
      s.status === "open" &&
      confirmed.length > 0 &&
      !window.confirm(
        `This session has ${confirmed.length} confirmed booking(s). Block anyway? Guests are NOT notified automatically.`
      )
    ) {
      return;
    }
    await act(
      { action: "set_status", sessionId: s.id, status: s.status === "open" ? "blocked" : "open" },
      s.status === "open" ? "Session blocked." : "Session unblocked."
    );
  };

  return (
    <div className="adm__detail">
      <span className="adm__sub">
        {fmtRow(s.starts_at)} · {fmtTime(s.starts_at)}–{fmtTime(s.ends_at)} ·{" "}
        continuation {s.continuation_starts_at ? fmtRow(s.continuation_starts_at) : "—"} ·{" "}
        {INSTRUCTOR_DISPLAY[s.instructor]} · {s.confirmed_seats}/{cap}
      </span>

      <div className="adm__actions">
        <button className="adm__btn" disabled={busy} onClick={onBlock}>
          {s.status === "open" ? "Block session" : "Unblock session"}
        </button>
        <button
          className="adm__btn"
          disabled={busy}
          onClick={() =>
            act(
              { action: "set_instructor", sessionId: s.id, instructor: otherInstructor },
              `Instructor → ${INSTRUCTOR_DISPLAY[otherInstructor]}.`
            )
          }
        >
          Instructor → {INSTRUCTOR_DISPLAY[otherInstructor]}
        </button>
        <button
          className="adm__btn"
          disabled={busy}
          onClick={() =>
            act(
              { action: "set_extra_spot", sessionId: s.id, enabled: !s.extra_spot_enabled },
              s.extra_spot_enabled ? "5th spot closed." : "5th spot open."
            )
          }
        >
          {s.extra_spot_enabled ? "Close 5th spot" : "Open 5th spot"}
        </button>
        <button className="adm__btn" disabled={busy} onClick={toggleManual}>
          Add manual booking
        </button>
      </div>

      {showManual && <ManualBookingForm sessionId={s.id} busy={busy} act={act} />}

      <ul className="adm__bookings">
        {s.bookings.length === 0 && <li className="adm__msg">No reservations.</li>}
        {s.bookings.map((b) => (
          <BookingRow key={b.id} booking={b} sessions={sessions} currentSession={s.id} busy={busy} act={act} />
        ))}
      </ul>
    </div>
  );
}

function BookingRow({
  booking: b,
  sessions,
  currentSession,
  busy,
  act,
}: {
  booking: AdminBooking;
  sessions: AdminSession[];
  currentSession: string;
  busy: boolean;
  act: (body: ActionBody, okMsg?: string) => Promise<boolean>;
}) {
  const [moveTo, setMoveTo] = useState("");
  const wa = b.phone.replace(/[^0-9]/g, "");
  const cancelled = b.status !== "confirmed";
  return (
    <li className="adm__bk" style={cancelled ? { opacity: 0.5 } : undefined}>
      <span className="who">
        <span>
          {b.customer_name} · {b.party_size}p · {b.metal_preference}
          {b.source === "admin" ? " · manual" : ""}
          {cancelled ? ` · ${b.status}` : ""}
        </span>
        <span className="mono">
          {b.booking_reference} · {b.email} · {b.phone}
          {b.customer_notes ? ` · “${b.customer_notes}”` : ""}
        </span>
      </span>
      <span className="ops">
        <a className="adm__btn" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>
        <a className="adm__btn" href={`mailto:${b.email}`}>Email</a>
        {!cancelled && (
          <>
            <select
              value={moveTo}
              onChange={(e) => setMoveTo(e.target.value)}
              style={{ background: "var(--ink-2)", color: "var(--paper)", border: "1px solid rgba(236,234,227,.32)", padding: "7px 8px", fontFamily: "var(--mono)", fontSize: 11 }}
              aria-label="Move to session"
            >
              <option value="">Move to…</option>
              {sessions
                .filter((s) => s.id !== currentSession && s.status === "open")
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {fmtRow(s.starts_at)}
                  </option>
                ))}
            </select>
            <button
              className="adm__btn"
              disabled={busy || !moveTo}
              onClick={() =>
                act(
                  { action: "move_booking", bookingId: b.id, targetSessionId: moveTo },
                  "Booking moved."
                )
              }
            >
              Move
            </button>
            <button
              className="adm__btn adm__btn--danger"
              disabled={busy}
              onClick={() => {
                if (window.confirm(`Cancel ${b.booking_reference} (${b.customer_name})?`)) {
                  act({ action: "cancel_booking", bookingId: b.id }, "Booking cancelled.");
                }
              }}
            >
              Cancel
            </button>
          </>
        )}
      </span>
    </li>
  );
}

function ManualBookingForm({
  sessionId,
  busy,
  act,
}: {
  sessionId: string;
  busy: boolean;
  act: (body: ActionBody, okMsg?: string) => Promise<boolean>;
}) {
  const [key] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `adm-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  );

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await act(
      {
        action: "manual_booking",
        sessionId,
        name: String(f.get("name") || ""),
        email: String(f.get("email") || ""),
        phone: String(f.get("phone") || ""),
        partySize: Number(f.get("party") || 1),
        metalPreference: String(f.get("metal") || "undecided"),
        notes: String(f.get("notes") || "") || undefined,
        idempotencyKey: key,
      },
      "Manual booking added."
    );
  };

  const inputStyle = {
    background: "var(--ink-2)",
    color: "var(--paper)",
    border: "1px solid rgba(236,234,227,.32)",
    padding: 10,
    colorScheme: "dark" as const,
    width: "100%",
  };

  return (
    <form className="adm__form" onSubmit={submit}>
      <label className="fld"><span>Name</span><input name="name" required minLength={2} style={inputStyle} /></label>
      <label className="fld"><span>Email</span><input name="email" type="email" required style={inputStyle} /></label>
      <label className="fld"><span>Phone</span><input name="phone" required style={inputStyle} /></label>
      <label className="fld"><span>Party</span>
        <select name="party" defaultValue="1" style={inputStyle}>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <label className="fld"><span>Metal</span>
        <select name="metal" defaultValue="undecided" style={inputStyle}>
          <option value="brass">Brass</option>
          <option value="silver_quote">Silver (quote)</option>
          <option value="gold_quote">Gold (quote)</option>
          <option value="undecided">Undecided</option>
        </select>
      </label>
      <label className="fld"><span>Notes</span><input name="notes" style={inputStyle} /></label>
      <div className="full">
        <button className="adm__btn" type="submit" disabled={busy}>Add booking</button>
      </div>
    </form>
  );
}
