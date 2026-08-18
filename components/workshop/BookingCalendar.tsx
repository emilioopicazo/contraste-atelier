"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";
import {
  seatDisplayState,
  presenceLabelCount,
  type MetalPreference,
  type PublicSession,
} from "@/lib/workshops/domain";
import {
  sessionDayLabel,
  sessionDayShort,
  sessionTimeRange,
} from "@/lib/workshops/format";
import { CONTACT, whatsappLink } from "@/lib/config";
import { track } from "@/lib/analytics";

interface BookingSuccess {
  booking_reference: string;
  starts_at: string;
  ends_at: string;
  party_size: number;
  metal_preference: MetalPreference;
}

type ApiError =
  | { code: "sold_out"; nextAvailable: PublicSession | null }
  | { code: "party_too_large"; remaining: number }
  | { code: "unavailable" }
  | { code: "invalid" }
  | { code: "error" };

function newIdempotencyKey(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `bk-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function collectUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((k) => {
    const v = p.get(k);
    if (v) out[k] = v.slice(0, 120);
  });
  if (document.referrer) out.referrer = document.referrer.slice(0, 200);
  return out;
}

export function BookingCalendar({
  locale,
  initialSessions,
  configured,
}: {
  locale: Locale;
  initialSessions: PublicSession[] | null;
  configured: boolean;
}) {
  const dict = getDictionary(locale);
  const t = dict.booking;
  const [sessions, setSessions] = useState<PublicSession[]>(initialSessions ?? []);
  const [openId, setOpenId] = useState<string | null>(null);
  const [viewers, setViewers] = useState<Record<string, number>>({});
  const [success, setSuccess] = useState<BookingSuccess | null>(null);

  useEffect(() => {
    track("workshop_view");
  }, []);

  /* ── availability refresh: realtime broadcast + polling fallback ── */
  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/sessions", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { sessions: PublicSession[] };
      setSessions(data.sessions);
    } catch {
      /* keep last known state */
    }
  }, []);

  useEffect(() => {
    if (!configured) return;
    const supabase = supabaseBrowser();
    if (!supabase) return;
    const channel = supabase
      .channel("workshop_sessions_public")
      .on("broadcast", { event: "availability" }, (msg) => {
        const p = msg.payload as {
          session_id: string;
          status: string;
          available_seats: number;
          effective_capacity: number;
        };
        setSessions((prev) =>
          prev
            .map((s) =>
              s.id === p.session_id
                ? {
                    ...s,
                    available_seats: p.available_seats,
                    effective_capacity: p.effective_capacity,
                  }
                : s
            )
            .filter((s) => (s.id === p.session_id ? p.status === "open" : true))
        );
      })
      .subscribe();
    const poll = window.setInterval(refresh, 60000);
    return () => {
      supabase.removeChannel(channel);
      window.clearInterval(poll);
    };
  }, [configured, refresh]);

  /* ── presence: join only while a specific session is open ── */
  useEffect(() => {
    if (!configured || !openId) return;
    const supabase = supabaseBrowser();
    if (!supabase) return;
    let key = sessionStorage.getItem("ca_presence_key");
    if (!key) {
      key = newIdempotencyKey();
      sessionStorage.setItem("ca_presence_key", key);
    }
    const channel = supabase.channel(`presence:session:${openId}`, {
      config: { presence: { key } },
    });
    channel
      .on("presence", { event: "sync" }, () => {
        const count = Object.keys(channel.presenceState()).length;
        setViewers((v) => ({ ...v, [openId]: count }));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") await channel.track({ at: Date.now() });
      });
    return () => {
      supabase.removeChannel(channel);
      setViewers((v) => ({ ...v, [openId]: 0 }));
    };
  }, [configured, openId]);

  const monthLabel = useMemo(() => {
    if (!sessions.length) return "";
    return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
      month: "short",
      timeZone: "America/Cancun",
    })
      .format(new Date(sessions[0].starts_at))
      .replace(".", "")
      .toUpperCase();
  }, [sessions, locale]);

  const seatsLabel = (available: number, short: boolean) => {
    const st = seatDisplayState(available);
    switch (st.kind) {
      case "sold_out":
        return short ? t.soldOutShort : t.soldOut;
      case "last":
        return short ? t.lastSpotShort : t.lastSpot;
      case "low":
        return short ? t.onlyLeftShort : t.onlyLeft;
      default:
        return short ? t.spotsShort(st.seats) : t.spots(st.seats);
    }
  };

  const onSelect = (s: PublicSession) => {
    const next = openId === s.id ? null : s.id;
    setOpenId(next);
    if (next) {
      track("workshop_session_select", { session_date: s.starts_at.slice(0, 10) });
      const st = seatDisplayState(s.available_seats);
      if (st.kind === "last") track("workshop_last_spot_view");
    }
  };

  /* ── not configured: truthful fallback, no fake availability ── */
  if (!configured || initialSessions === null) {
    return (
      <div className="cal" id="dates">
        <div className="cal__head">
          <h2 className="h3">{t.heading}</h2>
        </div>
        <p className="muted" style={{ maxWidth: "52ch" }}>
          {t.fallback.note}
        </p>
        <a
          className="btn btn--lg"
          href={whatsappLink(t.fallback.waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("whatsapp_click", { context: "booking_fallback" })}
        >
          {t.fallback.cta} <span className="arrow">→</span>
        </a>
      </div>
    );
  }

  if (success) {
    return (
      <Confirmation locale={locale} success={success} onDone={() => setSuccess(null)} />
    );
  }

  return (
    <div className="cal" id="dates">
      <div className="cal__head">
        <h2 className="h3">{t.heading}</h2>
        <span className="cal__month">{monthLabel}</span>
      </div>
      <p className="muted" style={{ maxWidth: "52ch", marginBottom: 8 }}>
        {t.subheading}
      </p>
      {sessions.length === 0 ? (
        <p className="cal__empty">{t.noSessions}</p>
      ) : (
        <ul className="cal__list">
          {sessions.map((s) => {
            const parts = sessionDayShort(s.starts_at, locale);
            const st = seatDisplayState(s.available_seats);
            const soldOut = st.kind === "sold_out";
            const isOpen = openId === s.id;
            const viewerCount = presenceLabelCount((viewers[s.id] ?? 0));
            return (
              <li className="cal__item" key={s.id}>
                <button
                  type="button"
                  className="cal__row"
                  aria-expanded={isOpen}
                  disabled={soldOut}
                  onClick={() => !soldOut && onSelect(s)}
                >
                  <span className="cal__date">
                    <span className="cal__day">{parts.day}</span>
                    <span className="cal__wd">
                      {parts.weekday} · {parts.month}
                    </span>
                  </span>
                  <span>
                    <span className="cal__time">
                      {sessionTimeRange(s.starts_at, s.ends_at, locale)}
                    </span>
                    {isOpen && viewerCount !== null && (
                      <span className="cal__viewers">{t.viewers(viewerCount)}</span>
                    )}
                  </span>
                  <span className="cal__seats" data-state={st.kind}>
                    {seatsLabel(s.available_seats, true)}
                  </span>
                </button>
                {isOpen && !soldOut && (
                  <BookingForm
                    locale={locale}
                    session={s}
                    onSuccess={(b) => {
                      setSuccess(b);
                      refresh();
                    }}
                    onSoldOutElsewhere={refresh}
                    onJumpTo={(id) => setOpenId(id)}
                    sessions={sessions}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ── booking form ─────────────────────────────────────────────────────── */

function BookingForm({
  locale,
  session,
  sessions,
  onSuccess,
  onSoldOutElsewhere,
  onJumpTo,
}: {
  locale: Locale;
  session: PublicSession;
  sessions: PublicSession[];
  onSuccess: (b: BookingSuccess) => void;
  onSoldOutElsewhere: () => void;
  onJumpTo: (id: string) => void;
}) {
  const dict = getDictionary(locale);
  const t = dict.booking;
  const [party, setParty] = useState(1);
  const [metal, setMetal] = useState<MetalPreference>("brass");
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const idemKey = useRef(newIdempotencyKey());
  const startedRef = useRef(false);

  const maxParty = Math.min(session.available_seats, 5);

  const onStart = () => {
    if (!startedRef.current) {
      startedRef.current = true;
      track("workshop_booking_start", { session_date: session.starts_at.slice(0, 10) });
    }
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const notes = String(form.get("notes") || "").trim();
    const honeypot = String(form.get("website") || "");

    const errs: Record<string, boolean> = {};
    if (name.length < 2) errs.name = true;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.email = true;
    if (phone.replace(/[^0-9]/g, "").length < 8) errs.phone = true;
    setFieldErrors(errs);
    if (Object.keys(errs).length) {
      setApiError({ code: "invalid" });
      return;
    }

    setSubmitting(true);
    setApiError(null);
    track("workshop_booking_submit", {
      session_date: session.starts_at.slice(0, 10),
      party_size: party,
      metal_preference: metal,
    });

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          name,
          email,
          phone,
          partySize: party,
          metalPreference: metal,
          notes: notes || undefined,
          idempotencyKey: idemKey.current,
          website: honeypot,
          utm: collectUtm(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        track("workshop_booking_success", {
          party_size: party,
          metal_preference: metal,
        });
        if (metal !== "brass" && metal !== "undecided") {
          track("workshop_metal_interest", { metal_preference: metal });
        }
        onSuccess({
          booking_reference: data.booking.booking_reference,
          starts_at: data.booking.starts_at,
          ends_at: data.booking.ends_at,
          party_size: data.booking.party_size,
          metal_preference: data.booking.metal_preference,
        });
        return;
      }
      track("workshop_booking_error", { code: data.code ?? "error" });
      if (data.code === "sold_out") {
        track("workshop_sold_out_view");
        setApiError({ code: "sold_out", nextAvailable: data.nextAvailable ?? null });
        onSoldOutElsewhere();
        idemKey.current = newIdempotencyKey();
      } else if (data.code === "party_too_large") {
        setApiError({ code: "party_too_large", remaining: data.remaining ?? 1 });
        onSoldOutElsewhere();
        idemKey.current = newIdempotencyKey();
      } else if (data.code === "unavailable") {
        setApiError({ code: "unavailable" });
        onSoldOutElsewhere();
      } else {
        setApiError({ code: "error" });
      }
    } catch {
      track("workshop_booking_error", { code: "network" });
      setApiError({ code: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const nextAvail =
    apiError?.code === "sold_out"
      ? apiError.nextAvailable ??
        sessions.find((s) => s.id !== session.id && s.available_seats > 0) ??
        null
      : null;

  return (
    <div className="bk">
      <div className="bk__in">
        {apiError && apiError.code !== "invalid" && (
          <div className="bk__alert" role="alert">
            {apiError.code === "sold_out" && (
              <>
                <strong>{t.errors.soldOut}</strong>
                {nextAvail && (
                  <>
                    {t.errors.nextAvailable}:{" "}
                    {sessionDayLabel(nextAvail.starts_at, locale)} ·{" "}
                    {sessionTimeRange(nextAvail.starts_at, nextAvail.ends_at, locale)}
                    <br />
                    <a
                      href="#dates"
                      onClick={(e) => {
                        e.preventDefault();
                        onJumpTo(nextAvail.id);
                      }}
                    >
                      {t.errors.bookNext} →
                    </a>
                  </>
                )}
              </>
            )}
            {apiError.code === "party_too_large" && (
              <strong>{t.errors.partyTooLarge(apiError.remaining)}</strong>
            )}
            {apiError.code === "unavailable" && <strong>{t.errors.unavailable}</strong>}
            {apiError.code === "error" && <strong>{t.errors.network}</strong>}
          </div>
        )}

        <form onSubmit={submit} onFocusCapture={onStart} noValidate>
          <div className="bk__grid">
            <label className={`fld${fieldErrors.name ? " fld--error" : ""}`}>
              <span>{t.form.name}</span>
              <input name="name" autoComplete="name" required minLength={2} />
            </label>
            <label className={`fld${fieldErrors.email ? " fld--error" : ""}`}>
              <span>{t.form.email}</span>
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label className={`fld${fieldErrors.phone ? " fld--error" : ""}`}>
              <span>{t.form.phone}</span>
              <input name="phone" inputMode="tel" autoComplete="tel" required />
            </label>
            <div className="fld">
              <span>{t.partySize}</span>
              <div className="bk__party" role="group" aria-label={t.partySize}>
                {Array.from({ length: maxParty }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={party === n}
                    onClick={() => setParty(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="fld full">
              <span>{t.form.metal}</span>
              <div className="bk__metal">
                {(
                  ["brass", "silver_quote", "gold_quote", "undecided"] as MetalPreference[]
                ).map((m) => (
                  <label key={m}>
                    <input
                      type="radio"
                      name="metal"
                      value={m}
                      checked={metal === m}
                      onChange={() => setMetal(m)}
                    />
                    {t.form.metalOptions[m]}
                  </label>
                ))}
              </div>
            </div>
            <label className="fld full">
              <span>{t.form.notes}</span>
              <textarea name="notes" rows={2} />
            </label>
            {/* honeypot */}
            <div className="hp-field" aria-hidden="true">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <p className="bk__consent full">{t.form.consent}</p>
            <div className="full">
              <button className="btn btn--lg bk__submit" type="submit" disabled={submitting}>
                {submitting ? t.form.submitting : t.form.submit}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── confirmation ─────────────────────────────────────────────────────── */

function Confirmation({
  locale,
  success,
  onDone,
}: {
  locale: Locale;
  success: BookingSuccess;
  onDone: () => void;
}) {
  const dict = getDictionary(locale);
  const t = dict.booking.confirmation;

  const icsHref = useMemo(() => {
    const fmt = (iso: string) =>
      new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Contraste Atelier//Workshop//EN",
      "BEGIN:VEVENT",
      `UID:${success.booking_reference}@contraste-atelier.com`,
      `DTSTAMP:${fmt(new Date().toISOString())}`,
      `DTSTART:${fmt(success.starts_at)}`,
      `DTEND:${fmt(success.ends_at)}`,
      "SUMMARY:Wax Ring Workshop — Contraste Atelier",
      `LOCATION:${CONTACT.address.street}\\, ${CONTACT.address.neighborhood}\\, ${CONTACT.address.postalCode} ${CONTACT.address.city}\\, ${CONTACT.address.region}\\, ${CONTACT.address.country}`,
      `DESCRIPTION:Reference ${success.booking_reference}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
  }, [success]);

  return (
    <div className="cal" id="dates">
      <div className="conf" role="status">
        <span className="kicker">
          <span className="dot" />
          Wax Ring Workshop
        </span>
        <h2 className="conf__title">{t.title}</h2>
        <ul className="conf__meta">
          <li>
            <span className="k">{dict.workshop.factLabels.days}</span>
            <span>{sessionDayLabel(success.starts_at, locale)}</span>
          </li>
          <li>
            <span className="k">{dict.workshop.factLabels.time}</span>
            <span>{sessionTimeRange(success.starts_at, success.ends_at, locale)}</span>
          </li>
          <li>
            <span className="k">{dict.booking.partySize}</span>
            <span>{t.participants(success.party_size)}</span>
          </li>
          <li>
            <span className="k">{dict.workshop.factLabels.place}</span>
            <span>
              CONTRASTE Atelier · {CONTACT.address.neighborhood} · {CONTACT.address.city}
            </span>
          </li>
          <li>
            <span className="k">{t.reference}</span>
            <span className="conf__ref">{success.booking_reference}</span>
          </li>
        </ul>
        <div className="conf__notes">
          <p>{t.metalNote}</p>
          <p>{t.continuationNote}</p>
        </div>
        <div className="conf__actions">
          <a className="btn" href={icsHref} download="contraste-workshop.ics">
            {t.addToCalendar}
          </a>
          <a
            className="btn btn--ghost"
            href={CONTACT.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("maps_click", { context: "confirmation" })}
          >
            {t.directions} →
          </a>
          <a
            className="btn btn--ghost"
            href={whatsappLink(
              `Hi! About my reservation ${success.booking_reference} (Wax Ring Workshop)`
            )}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp_click", { context: "confirmation" })}
          >
            {t.whatsapp} →
          </a>
        </div>
        <p style={{ marginTop: 22 }}>
          <button className="link-underline" type="button" onClick={onDone}>
            ← {dict.booking.heading}
          </button>
        </p>
      </div>
    </div>
  );
}
