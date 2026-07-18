"use client";

import Link from "next/link";

import { PixelIcon } from "@/components/PixelIcon";

type TopLeftNavigationProps = {
  className?: string;
};

export function TopLeftNavigation({ className }: TopLeftNavigationProps) {
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
      <button
        className="hud-navigation-button"
        type="button"
        aria-label="Back to previous page"
        title="Back"
        onClick={() => window.history.back()}
      >
        <PixelIcon name="back" size="small" />
      </button>
    </div>
  );
}
