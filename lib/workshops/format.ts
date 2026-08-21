import { WORKSHOP_TIMEZONE } from "./domain";
import type { Locale } from "@/lib/i18n/locales";

const localeTag: Record<Locale, string> = { en: "en-US", es: "es-MX" };

export function sessionDayLabel(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(localeTag[locale], {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: WORKSHOP_TIMEZONE,
  }).format(new Date(iso));
}

export function sessionDayShort(iso: string, locale: Locale): {
  weekday: string;
  day: string;
  month: string;
} {
  const d = new Date(iso);
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(localeTag[locale], { ...opts, timeZone: WORKSHOP_TIMEZONE }).format(d);
  return {
    weekday: fmt({ weekday: "short" }).replace(".", "").toUpperCase(),
    day: fmt({ day: "2-digit" }),
    month: fmt({ month: "short" }).replace(".", "").toUpperCase(),
  };
}

export function sessionTimeRange(startIso: string, endIso: string, locale: Locale): string {
  const fmt = new Intl.DateTimeFormat(localeTag[locale], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: WORKSHOP_TIMEZONE,
  });
  const clean = (s: string) => s.replace(/ /g, " ").replace(/\s?[ap]\.\s?m\./i, (m) => m.toUpperCase());
  return `${clean(fmt.format(new Date(startIso)))} – ${clean(fmt.format(new Date(endIso)))}`;
}

export function sessionDateISO(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: WORKSHOP_TIMEZONE,
  }).format(new Date(iso));
}
