"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { localePath, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { CartButton } from "@/components/commerce/CartButton";

export function Header({
  locale,
  dict,
  shopEnabled,
}: {
  locale: Locale;
  dict: Dictionary["nav"];
  shopEnabled: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname() || "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Path without locale prefix, for the language toggle.
  const basePath = pathname.startsWith("/es")
    ? pathname.replace(/^\/es/, "") || "/"
    : pathname;

  // Only the home hero sits dark behind the fixed header; every other page
  // gets the solid chrome immediately so the nav stays legible on paper zones.
  const solid = basePath !== "/" || scrolled;

  const href = (path: string) => localePath(locale, path);

  return (
    <header className="head" data-scrolled={String(solid)}>
      <Link className="brand" href={href("/")} aria-label={dict.home}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/star-cream.png" alt="" width={30} height={30} />
        <span className="wm">Contraste</span>
      </Link>
      <div className="head__right">
        <span className="lang-toggle" aria-label="Language / Idioma">
          <Link
            className={`lang-toggle__o${locale === "en" ? " is-on" : ""}`}
            href={basePath}
            hrefLang="en"
          >
            EN
          </Link>
          <span className="lang-toggle__sep">/</span>
          <Link
            className={`lang-toggle__o${locale === "es" ? " is-on" : ""}`}
            href={basePath === "/" ? "/es" : `/es${basePath}`}
            hrefLang="es"
          >
            ES
          </Link>
        </span>
        <Link className="head__link" href={href("/workshops/wax-ring")}>
          {dict.workshop}
        </Link>
        {shopEnabled && (
          <Link className="head__link" href={href("/shop")}>
            {dict.shop}
          </Link>
        )}
        <Link className="head__link" href={href("/gallery")}>
          {dict.gallery}
        </Link>
        <Link className="head__link" href={href("/visit")}>
          {dict.visit}
        </Link>
        <Link className="head__cta" href={href("/workshops/wax-ring")}>
          {dict.reserve}
        </Link>
        {shopEnabled && <CartButton label={dict.openCart} />}
      </div>
    </header>
  );
}
