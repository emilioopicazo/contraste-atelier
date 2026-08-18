import Link from "next/link";
import { CONTACT, whatsappLink } from "@/lib/config";
import { localePath, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function Footer({
  locale,
  dict,
  shopEnabled,
}: {
  locale: Locale;
  dict: Dictionary;
  shopEnabled: boolean;
}) {
  const href = (path: string) => localePath(locale, path);
  const year = new Date().getFullYear();

  return (
    <footer className="foot zone zone--ink">
      <div className="wrap">
        <div className="foot__top">
          <div className="foot__brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/star-cream.png" alt="Contraste Atelier" />
            <div className="wm">Contraste</div>
            <p>{dict.footer.tagline}</p>
          </div>
          <div className="foot__col">
            <h4>{dict.footer.workshop}</h4>
            <ul>
              <li>
                <Link href={href("/workshops/wax-ring")}>{dict.footer.waxRing}</Link>
              </li>
              <li>
                <Link href={href("/workshops/wax-ring")}>{dict.footer.bookSession} →</Link>
              </li>
              {shopEnabled && (
                <li>
                  <Link href={href("/shop")}>{dict.nav.shop} →</Link>
                </li>
              )}
              <li>
                <Link href={href("/gallery")}>{dict.nav.gallery} →</Link>
              </li>
            </ul>
          </div>
          <div className="foot__col">
            <h4>{dict.footer.visitCol}</h4>
            <ul>
              <li>
                <span>
                  {CONTACT.address.street}, {CONTACT.address.neighborhood}
                </span>
              </li>
              <li>
                <span>
                  {CONTACT.address.postalCode} {CONTACT.address.city},{" "}
                  {CONTACT.address.region}, {CONTACT.address.country}
                </span>
              </li>
              <li>
                <a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer">
                  {dict.visit.openMaps} →
                </a>
              </li>
              <li>
                <span className="label" style={{ marginTop: 6 }}>
                  {dict.visit.reservationOnly}
                </span>
              </li>
            </ul>
          </div>
          <div className="foot__col">
            <h4>{dict.footer.connectCol}</h4>
            <ul>
              <li>
                <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer">
                  Instagram · @{CONTACT.instagramHandle} →
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink(dict.visit.whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {dict.visit.whatsapp} →
                </a>
              </li>
              <li>
                <Link href={href("/visit")}>{dict.nav.visit} →</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="foot__bottom">
          <span>
            © {year} {dict.footer.rights}
          </span>
          <span>
            {CONTACT.address.neighborhood} · {CONTACT.address.city} · {CONTACT.address.country}
          </span>
        </div>
      </div>
    </footer>
  );
}
