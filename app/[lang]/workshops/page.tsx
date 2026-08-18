import { redirect } from "next/navigation";
import { localePath, isLocale } from "@/lib/i18n/locales";

/* One public workshop in V1 — the index forwards to it (no thin page). */
export default async function WorkshopsIndex({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(localePath(isLocale(lang) ? lang : "en", "/workshops/wax-ring"));
}
