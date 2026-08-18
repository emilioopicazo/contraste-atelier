import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { CONTACT, whatsappLink } from "@/lib/config";
import { pageMetadata } from "@/lib/seo/meta";
import { buildLocalBusinessJsonLd } from "@/lib/seo/jsonld";
import { TrackLink } from "@/components/site/TrackLink";
import { AutoVideo } from "@/components/site/AutoVideo";

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
    path: "/visit",
    title: `${dict.visit.heading} — Contraste Atelier · ${CONTACT.address.city}`,
    description: `${CONTACT.address.street}, ${CONTACT.address.neighborhood}, ${CONTACT.address.postalCode} ${CONTACT.address.city}, ${CONTACT.address.region}. ${dict.visit.reservationOnly}.`,
  });
}

export default async function VisitPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = getDictionary(locale);

  return (
    <main className="zone zone--ink" style={{ paddingTop: "clamp(96px,14vh,150px)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildLocalBusinessJsonLd()) }}
      />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <span className="kicker">
            <span className="dot" />
            {dict.visit.kicker}
          </span>
          <h1 className="h2" style={{ margin: "16px 0 40px" }}>
            {dict.visit.heading}
          </h1>
          <div className="visit">
            <div>
              <address className="visit__addr">
                <span className="label">Contraste Atelier</span>
                {CONTACT.address.street}, {CONTACT.address.neighborhood}
                <br />
                {CONTACT.address.postalCode} {CONTACT.address.city}, {CONTACT.address.region}
                <br />
                {CONTACT.address.country}
              </address>
              <p className="label" style={{ marginTop: 18 }}>
                {dict.visit.reservationOnly}
              </p>
              <div className="visit__actions">
                <TrackLink
                  event="maps_click"
                  external
                  href={CONTACT.mapsUrl}
                  className="btn btn--lg"
                >
                  {dict.visit.openMaps} <span className="arrow">→</span>
                </TrackLink>
                <TrackLink
                  event="whatsapp_click"
                  external
                  href={whatsappLink(dict.visit.whatsappMessage)}
                  className="btn btn--ghost btn--lg"
                >
                  {dict.visit.whatsapp} <span className="arrow">→</span>
                </TrackLink>
              </div>
            </div>
            <figure className="media reveal-media" style={{ aspectRatio: "4/3" }}>
              <AutoVideo className="media__v" src="/uploads/IMG_5604_web.mp4" lazy />
            </figure>
          </div>
        </div>
      </section>
    </main>
  );
}
