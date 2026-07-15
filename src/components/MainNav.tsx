"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { PixelHudStat } from "@/components/PixelHudStat";
import { PixelIcon } from "@/components/PixelIcon";

const navItems = [
  { href: "/", label: "Academy" },
  { href: "/learn", label: "Learn" },
  { href: "/practice", label: "Interview Center" },
  { href: "/progress", label: "Progress Library" },
  { href: "/settings", label: "Settings" },
];

function getBackDestination(pathname: string) {
  if (pathname.startsWith("/learn/star-method/exercise")) {
    return { href: "/learn/star-method", label: "Back to STAR Method lesson" };
  }
  if (pathname.startsWith("/learn/star-method")) {
    return { href: "/learn", label: "Back to Interview Foundations" };
  }
  if (pathname === "/learn") {
    return { href: "/academy", label: "Back to Academy Hub" };
  }
  if (pathname === "/settings") {
    return { href: "/academy", label: "Back to Academy Hub" };
  }
  if (pathname !== "/") {
    return { href: "/", label: "Back to Academy" };
  }
  return { href: "/", label: "Academy home" };
}

export function MainNav() {
  const pathname = usePathname();
  const backDestination = getBackDestination(pathname);

  return (
    <header className="site-header">
      <div className="hud-identity">
        <Link
          className="hud-back-link"
          href={backDestination.href}
          aria-label={backDestination.label}
        >
          <PixelIcon name="back" size="small" />
        </Link>
        <Link className="brand" href="/" aria-label="Ameego home">
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
              item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

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
      <div className="hud-player-status" aria-label="Academy player status">
        <PixelHudStat label="XP" value="0000" icon="star" />
        <PixelHudStat label="LV" value="01" />
      </div>
    </header>
  );
}
