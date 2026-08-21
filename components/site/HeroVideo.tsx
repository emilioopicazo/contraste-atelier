"use client";

import { useEffect, useRef } from "react";

/* Hero media: picks the desktop or mobile file via matchMedia before
   loading, so phones never download the desktop video (spec §56). */

export function HeroVideo({
  desktopSrc,
  mobileSrc,
}: {
  desktopSrc: string;
  mobileSrc: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const mobile = window.matchMedia("(max-width: 720px)").matches;
    v.src = mobile ? mobileSrc : desktopSrc;
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    const p = v.play();
    p?.catch?.(() => {
      v.addEventListener("loadeddata", () => v.play().catch(() => {}), { once: true });
    });
  }, [desktopSrc, mobileSrc]);

  return (
    <video
      ref={ref}
      className="media__v hero__v"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
    />
  );
}
