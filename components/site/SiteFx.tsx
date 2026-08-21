"use client";

import { useEffect } from "react";

/* Site-wide progressive effects: reveal-on-scroll and play-videos-in-view.
   Pure enhancement — content is fully visible without JS (CSS hides .reveal
   only when motion is allowed, and a safety pass un-hides everything). */

export function SiteFx() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── reveal on scroll ──
    const revealEls = Array.from(document.querySelectorAll<HTMLElement>(".reveal, .reveal-media"));
    const show = (el: HTMLElement) => el.classList.add("in");
    let io: IntersectionObserver | undefined;
    if (!reduced && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              show(en.target as HTMLElement);
              io?.unobserve(en.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
      revealEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.95 && r.bottom > 0) show(el);
        else io!.observe(el);
      });
    } else {
      revealEls.forEach(show);
    }
    // Safety: never leave content hidden.
    const safety = window.setTimeout(() => revealEls.forEach(show), 3000);

    // ── videos: assert autoplay props, play in view, pause offscreen ──
    const vids = Array.from(document.querySelectorAll<HTMLVideoElement>("video[data-auto]"));
    const tryPlay = (v: HTMLVideoElement) => {
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
      const p = v.play();
      if (p?.catch) {
        p.catch(() => {
          v.addEventListener("loadeddata", () => tryPlay(v), { once: true });
        });
      }
    };
    let vio: IntersectionObserver | undefined;
    if (vids.length) {
      if ("IntersectionObserver" in window) {
        vio = new IntersectionObserver(
          (entries) => {
            entries.forEach((en) => {
              const v = en.target as HTMLVideoElement;
              if (en.isIntersecting) {
                if (v.dataset.lazy && !v.src && v.dataset.src) v.src = v.dataset.src;
                tryPlay(v);
              } else {
                v.pause();
              }
            });
          },
          { threshold: 0.01, rootMargin: "200px 0px" }
        );
        vids.forEach((v) => vio!.observe(v));
      } else {
        vids.forEach((v) => {
          if (v.dataset.src && !v.src) v.src = v.dataset.src;
          tryPlay(v);
        });
      }
      const resume = () => {
        vids.forEach((v) => {
          const r = v.getBoundingClientRect();
          if (v.paused && r.top < window.innerHeight && r.bottom > 0) tryPlay(v);
        });
      };
      ["touchstart", "click", "scroll", "keydown"].forEach((evt) =>
        document.addEventListener(evt, resume, { passive: true, once: true })
      );
    }

    return () => {
      window.clearTimeout(safety);
      io?.disconnect();
      vio?.disconnect();
    };
  }, []);

  return null;
}
