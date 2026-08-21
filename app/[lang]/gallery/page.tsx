import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo/meta";
import { AutoVideo } from "@/components/site/AutoVideo";

const CLIPS = [
  { src: "/uploads/IMG_5825_web.mp4", cls: "g1" },
  { src: "/uploads/IMG_5596_web.mp4", cls: "g2" },
  { src: "/uploads/IMG_5598_web.mp4", cls: "g3" },
  { src: "/uploads/IMG_5604_web.mp4", cls: "g4" },
  { src: "/uploads/IMG_5606_web.mp4", cls: "g5" },
  { src: "/uploads/IMG_5623_web.mp4", cls: "g6" },
];

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
    path: "/gallery",
    title: `${dict.nav.gallery} — Contraste Atelier`,
    description: dict.gallery.caption,
  });
}

export default async function GalleryPage({
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
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <h1 className="h2">{dict.nav.gallery}</h1>
          </div>
          <div className="gal">
            {CLIPS.map((c, i) => (
              <figure
                key={c.src}
                className={`media reveal-media ${c.cls}`}
                style={{ "--md": `${i * 0.05}s` } as React.CSSProperties}
              >
                <AutoVideo className="media__v" src={c.src} lazy={i > 1} priority={i === 0} />
              </figure>
            ))}
            <div className="gal__cap">
              <span className="lead" style={{ fontFamily: "var(--head)" }}>
                {dict.gallery.caption}
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
