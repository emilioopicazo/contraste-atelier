/* Server component. Renders a muted looping video enhanced by SiteFx:
   asserted autoplay on mount, played only in view, optional lazy src. */

export function AutoVideo({
  src,
  className,
  lazy = false,
  priority = false,
}: {
  src: string;
  className?: string;
  lazy?: boolean;
  priority?: boolean;
}) {
  if (lazy) {
    return (
      <video
        className={className}
        data-auto=""
        data-lazy=""
        data-src={src}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
      />
    );
  }
  return (
    <video
      className={className}
      data-auto=""
      autoPlay
      muted
      loop
      playsInline
      preload={priority ? "auto" : "metadata"}
      aria-hidden="true"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
