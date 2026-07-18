"use client";

import Link from "next/link";

import { PixelIcon } from "@/components/PixelIcon";

type TopLeftNavigationProps = {
  className?: string;
  backHref?: string;
  backLabel?: string;
};

export function TopLeftNavigation({
  className,
  backHref,
  backLabel = "Back to previous page",
}: TopLeftNavigationProps) {
  const classes = ["top-left-navigation", className].filter(Boolean).join(" ");

  return (
    <div className={classes} role="group" aria-label="Page navigation">
      <Link
        className="hud-navigation-button"
        href="/"
        aria-label="Home — return to Landing Page"
        title="Landing Page"
      >
        <PixelIcon name="home" size="small" />
      </Link>
      {backHref ? (
        <Link
          className="hud-navigation-button"
          href={backHref}
          aria-label={backLabel}
          title="Back"
        >
          <PixelIcon name="back" size="small" />
        </Link>
      ) : (
        <button
          className="hud-navigation-button"
          type="button"
          aria-label={backLabel}
          title="Back"
          onClick={() => window.history.back()}
        >
          <PixelIcon name="back" size="small" />
        </button>
      )}
    </div>
  );
}
