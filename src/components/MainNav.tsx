"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Academy" },
  { href: "/learn", label: "Learn" },
  { href: "/practice", label: "Interview Center" },
  { href: "/progress", label: "Progress Library" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Ameego home">
        <span className="brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </span>
        <span>Ameego</span>
      </Link>
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
      <span className="header-status">
        <span aria-hidden="true" /> Academy open
      </span>
    </header>
  );
}
