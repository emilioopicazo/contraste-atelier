import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, localePath, type Locale } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { CONTACT, isShopifyEnabled } from "@/lib/config";
import { pageMetadata } from "@/lib/seo/meta";
import { buildLocalBusinessJsonLd } from "@/lib/seo/jsonld";
import { HeroVideo } from "@/components/site/HeroVideo";
import { AutoVideo } from "@/components/site/AutoVideo";
import { TrackLink } from "@/components/site/TrackLink";
import { FeaturedProducts } from "@/components/commerce/FeaturedProducts";

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
    path: "/",
    title: dict.meta.homeTitle,
    description: dict.meta.homeDescription,
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = getDictionary(locale);
  const shopEnabled = isShopifyEnabled();
  const href = (path: string) => localePath(locale, path);
  const jsonLd = buildLocalBusinessJsonLd();

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── 01 · HERO ── */}
      <section className="hero zone zone--ink">
        <div className="hero__media">
          <HeroVideo
            desktopSrc="/uploads/contraste_web_hero.mp4"
            mobileSrc="/uploads/contraste_mobile_hero.mp4"
          />
        </div>
        <div className="hero__inner wrap">
          <h1 className="display h-rise" style={{ "--hd": ".15s" } as React.CSSProperties}>
            {dict.hero.headline}
          </h1>
          <div className="hero__ctas h-rise" style={{ "--hd": ".35s" } as React.CSSProperties}>
            <TrackLink
              event="hero_workshop_click"
              className="hero__reserve"
              href={href("/workshops/wax-ring")}
            >
              {dict.hero.ctaWorkshop} <span className="arrow">→</span>
            </TrackLink>
            {shopEnabled && (
              <TrackLink event="hero_shop_click" className="hero__secondary" href={href("/shop")}>
                {dict.hero.ctaShop} <span className="arrow">→</span>
              </TrackLink>
            )}
          </div>
        </div>
      </section>

      {/* ── stats / trust bar ── */}
      <section className="stats zone zone--ink" aria-label="The workshop at a glance">
        <div className="wrap stats__grid">
          {dict.stats.map((s, i) => (
            <div className="stat reveal" data-d={i || undefined} key={s.l}>
              <span className="stat__n">{s.n}</span>
              <span className="stat__l">{s.l}</span>
              <span className="stat__s">{s.s}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 02 · ATELIER / ABOUT ── */}
      <section className="section zone zone--ink" id="about">
        <div className="wrap">
          <div className="sec-head reveal">
            <h2 className="h2">{dict.about.heading}</h2>
          </div>
          <div className="about">
            <div className="about__media reveal">
              <figure className="media reveal reveal-media">
                <AutoVideo className="media__v" src="/uploads/IMG_5588_web.mp4" lazy />
              </figure>
              <span className="about__tag">{dict.about.tag}</span>
            </div>
            <div className="body reveal" data-d="1">
              <p className="lead">{dict.about.lead}</p>
              <p className="muted">{dict.about.body}</p>
              <ul className="keys">
                {dict.about.keys.map((k, i) => (
                  <li key={i}>
                    <span className="n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="t">{k}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 03 · WORKSHOP MODULE ── */}
      <section className="section zone zone--paper" id="workshop">
        <div className="wrap">
          <div className="ws reveal">
            <div>
              <span className="kicker">
                <span className="dot" />
                {dict.workshop.kicker}
              </span>
              <h2 className="ws__title">{dict.workshop.title}</h2>
              <p className="lead ws__intro">{dict.workshop.intro}</p>
              <ul className="ws__facts">
                <li><span className="k">{dict.workshop.factLabels.days}</span> {dict.workshop.facts.days}</li>
                <li><span className="k">{dict.workshop.factLabels.time}</span> {dict.workshop.facts.time}</li>
                <li><span className="k">{dict.workshop.factLabels.place}</span> {dict.workshop.facts.place}</li>
                <li><span className="k">{dict.workshop.factLabels.group}</span> {dict.workshop.facts.group}</li>
              </ul>
              <p className="ws__metal">{dict.workshop.metal}</p>
              <p className="ws__note">{dict.workshop.continuation}</p>
              <div className="ws__cta">
                <Link className="btn btn--lg" href={href("/workshops/wax-ring")}>
                  {dict.workshop.cta} <span className="arrow">→</span>
                </Link>
                <Link className="link-underline" href={href("/workshops/wax-ring")}>
                  {dict.workshop.seeDates} →
                </Link>
              </div>
            </div>
            <figure className="media reveal-media" style={{ aspectRatio: "4/5" }}>
              <AutoVideo className="media__v" src="/uploads/IMG_5598_web.mp4" lazy />
            </figure>
          </div>
        </div>
      </section>

      {/* ── 06 · SHOP MODULE ── */}
      <section className="section--tight zone zone--ink" id="shop">
        <div className="wrap reveal">
          {shopEnabled ? (
            <FeaturedProducts locale={locale} dict={dict.shop} />
          ) : (
            <div className="shop-module">
              <div className="shop-module__l">
                <span className="soon__badge">{dict.shop.comingSoon}</span>
                <h3>{dict.shop.comingSoonBody}</h3>
              </div>
              <span className="shop-module__tag">{dict.shop.kicker}</span>
            </div>
          )}
        </div>
      </section>

      {/* ── 08 · INSTAGRAM ── */}
      <section className="section--tight zone zone--ink">
        <div className="wrap ig-band__row reveal">
          <div className="ig-band__l">
            <span className="ig-kicker">
              <span className="ig-glyph" />
              {dict.instagram.kicker}
            </span>
            <h3 className="ig-band__h">
              <TrackLink
                event="instagram_click"
                external
                href={CONTACT.instagramUrl}
                className="ig-handle"
              >
                @{CONTACT.instagramHandle}
              </TrackLink>
            </h3>
          </div>
          <TrackLink
            event="instagram_click"
            external
            href={CONTACT.instagramUrl}
            className="btn btn--ghost btn--lg"
          >
            {dict.instagram.follow} <span className="arrow">→</span>
          </TrackLink>
        </div>
      </section>
    </main>
  );
}
