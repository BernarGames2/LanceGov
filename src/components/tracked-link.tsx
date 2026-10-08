"use client";

import Link from "next/link";

import { track, type AnalyticsEvent } from "@/lib/analytics";

type Props = Omit<React.ComponentProps<typeof Link>, "href"> & {
  href: string;
  event: AnalyticsEvent;
  eventProps?: Record<string, string>;
};

/** Link que registra um evento de analytics no clique. Links externos abrem em nova aba. */
export function TrackedLink({ href, event, eventProps, onClick, ...props }: Props) {
  const external = /^https?:\/\//.test(href);

  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={(e) => {
        track(event, eventProps);
        onClick?.(e);
      }}
      {...props}
    />
  );
}
