import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatMXN, isSupabaseConfigured, workshopPriceMXN } from "@/lib/config";
import { pageMetadata } from "@/lib/seo/meta";
import { fetchPublicSessions } from "@/lib/workshops/api";
import { BookingCalendar } from "@/components/workshop/BookingCalendar";
import { AutoVideo } from "@/components/site/AutoVideo";

export const dynamic = "force-dynamic"; // availability must be fresh per request

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return pageMetadata({
    locale: lang,
    path: "/workshops/wax-ring",
    title: dict.meta.workshopTitle,
    description: dict.meta.workshopDescription,
  });
}

export default async function WaxRingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = getDictionary(locale);
  const price = workshopPriceMXN();
  const configured = isSupabaseConfigured();
  const sessions = configured ? await fetchPublicSessions() : null;

  return (
    <main className="zone zone--paper" style={{ paddingTop: "clamp(96px,14vh,150px)" }}>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <span className="kicker">
            <span className="dot" />
            {dict.workshop.kicker}
          </span>
          <div className="ws" style={{ marginTop: 8 }}>
            <div>
              <h1 className="ws__title">{dict.workshop.title}</h1>
              <p className="lead ws__intro">{dict.workshop.intro}</p>
              <ul className="ws__facts">
                <li><span className="k">{dict.workshop.factLabels.days}</span> {dict.workshop.facts.days}</li>
                <li><span className="k">{dict.workshop.factLabels.time}</span> {dict.workshop.facts.time}</li>
                <li><span className="k">{dict.workshop.factLabels.place}</span> {dict.workshop.facts.place}</li>
                <li><span className="k">{dict.workshop.factLabels.group}</span> {dict.workshop.facts.group}</li>
              </ul>
              <p className="ws__metal">{dict.workshop.metal}</p>
              <p className="ws__note">{dict.workshop.continuation}</p>
              {price !== null && (
                <p className="ws__price">
                  {formatMXN(price)}
                  <small>{dict.workshop.priceFrom}</small>
                </p>
              )}
            </div>
            <div>
              <figure
                className="media reveal-media"
                style={{ aspectRatio: "4/3", marginBottom: "clamp(24px,4vw,40px)" }}
              >
                <AutoVideo className="media__v" src="/uploads/IMG_5825_web.mp4" priority />
              </figure>
              <ul className="ws__flow">
                {dict.workshop.flow.map((f, i) => (
                  <li key={f.t}>
                    <span className="n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="t">{f.t}</span>
                    <span className="d">{f.d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── AVAILABLE DATES / BOOKING ── */}
          <BookingCalendar
            locale={locale}
            initialSessions={sessions}
            configured={configured}
          />
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="section zone zone--ink" id="process">
        <div className="wrap">
          <div className="sec-head reveal">
            <h2 className="h2">{dict.process.heading}</h2>
          </div>
          <p className="lead proc-intro reveal muted">{dict.process.lead}</p>
          <div className="proc reveal">
            {dict.process.steps.map((s, i) => (
              <article className="step" key={s.t}>
                <span className="step__n">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="step__t">{s.t}</h3>
                <p className="step__d">{s.d}</p>
                {i === 0 && <span className="step__ghost">✳</span>}
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
