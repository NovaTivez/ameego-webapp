"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ExperienceControls } from "@/components/ExperienceControls";
import { PixelHudStat } from "@/components/PixelHudStat";
import { PixelIcon } from "@/components/PixelIcon";
import { TopLeftNavigation } from "@/components/TopLeftNavigation";

const navItems = [
  { href: "/", label: "Academy" },
  { href: "/learn", label: "Learn" },
  { href: "/practice", label: "Interview Center" },
  { href: "/progress", label: "Progress Library" },
  { href: "/settings", label: "Settings" },
];

export function MainNav() {
  const pathname = usePathname();
  const usesFullscreenWorld = pathname === "/" || pathname === "/academy";
  const usesStandaloneExperienceControls = pathname === "/";

  return (
    <>
      <header className="site-header">
        <div className="hud-identity">
          <TopLeftNavigation />
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
                item.href === "/"
                  ? pathname === item.href || pathname === "/academy/home"
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
