"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ExperienceControls } from "@/components/ExperienceControls";
import { PixelHudStat } from "@/components/PixelHudStat";
import { PixelIcon } from "@/components/PixelIcon";

const navItems = [
  { href: "/academy", label: "Academy" },
  { href: "/learn", label: "Learn" },
  { href: "/practice", label: "Interview Center" },
  { href: "/progress", label: "Progress Library" },
  { href: "/settings", label: "Settings" },
];

function getBackDestination(pathname: string) {
  if (pathname === "/academy") {
    return { href: "/", label: "Back to title screen" };
  }
  if (pathname === "/academy/home") {
    return { href: "/academy", label: "Back to Academy campus" };
  }
  if (pathname.startsWith("/learn/academy/")) {
    return { href: "/learn", label: "Back to Interview Skills Academy" };
  }
  if (pathname.startsWith("/learn/star-method/exercise")) {
    return { href: "/learn/star-method", label: "Back to STAR Method lesson" };
  }
  if (pathname.startsWith("/learn/star-method")) {
    return { href: "/learn", label: "Back to Interview Foundations" };
  }
  if (pathname === "/learn") {
    return { href: "/academy", label: "Back to Academy campus" };
  }
  if (pathname === "/settings") {
    return { href: "/academy", label: "Back to Academy campus" };
  }
  if (pathname !== "/") {
    return { href: "/academy", label: "Back to Academy campus" };
  }
  return { href: "/", label: "Back to title screen" };
}

export function MainNav() {
  const pathname = usePathname();
  const backDestination = getBackDestination(pathname);
  const brandDestination =
    pathname === "/"
      ? { href: "/", label: "Ameego title screen" }
      : { href: "/academy", label: "Ameego Academy campus" };
  const usesFullscreenWorld = pathname === "/" || pathname === "/academy";
  const usesStandaloneExperienceControls = pathname === "/";

  return (
    <>
      <header className="site-header">
        <div className="hud-identity">
          <Link
            className="hud-back-link"
            href={backDestination.href}
            aria-label={backDestination.label}
          >
            <PixelIcon name="back" size="small" />
          </Link>
          <Link
            className="brand"
            href={brandDestination.href}
            aria-label={brandDestination.label}
          >
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
            <span>Ameego Academy</span>
          </Link>
        </div>
        <nav aria-label="Main navigation">
          <ul className="nav-list">
            {navItems.map((item) => {
              const isCurrent =
                item.href === "/academy"
                  ? pathname === "/academy" || pathname.startsWith("/academy/")
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    className="nav-link"
                    href={item.href}
                    aria-current={isCurrent ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        {!usesFullscreenWorld ? (
          <div className="hud-control-group" aria-label="Academy header controls">
            <div className="hud-player-status" aria-label="Academy player status">
              <PixelHudStat label="XP" value="0000" icon="star" />
              <PixelHudStat label="LV" value="01" />
            </div>
            <ExperienceControls />
            <Link
              className="hud-settings-link"
              href="/settings"
              aria-label="Open Settings"
              aria-current={pathname === "/settings" ? "page" : undefined}
              title="Settings"
            >
              <PixelIcon name="settings" size="small" />
            </Link>
          </div>
        ) : null}
      </header>
      {usesStandaloneExperienceControls ? <ExperienceControls /> : null}
    </>
  );
}
