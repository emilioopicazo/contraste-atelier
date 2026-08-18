"use client";

import Link from "next/link";
import { track, type AnalyticsEvent } from "@/lib/analytics";
import type { ComponentProps, ReactNode } from "react";

export function TrackLink({
  event,
  eventParams,
  children,
  external,
  ...props
}: {
  event: AnalyticsEvent;
  eventParams?: Record<string, string | number>;
  external?: boolean;
  children: ReactNode;
} & ComponentProps<typeof Link>) {
  const onClick = () => track(event, eventParams);
  if (external) {
    const { href, ...rest } = props;
    return (
      <a
        href={String(href)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        {...(rest as ComponentProps<"a">)}
      >
        {children}
      </a>
    );
  }
  return (
    <Link {...props} onClick={onClick}>
      {children}
    </Link>
  );
}
