import Link from "next/link";

import type { AcademyLocation } from "@/lib/academy";

type AcademyMenuProps = {
  locations: AcademyLocation[];
};

export function AcademyMenu({ locations }: AcademyMenuProps) {
  return (
    <nav className="academy-menu" aria-label="Academy menu">
      <div className="academy-menu-heading">
        <p className="eyebrow">Keyboard-friendly directory</p>
        <h2>Choose a location from the menu.</h2>
      </div>
      <ul>
        {locations.map((location, index) => (
          <li key={location.id}>
            <span className="academy-menu-number" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              {location.href ? (
                <Link href={location.href}>
                  {location.name}
                  {location.recommended ? (
                    <span className="sr-only">, recommended next activity</span>
                  ) : null}
                </Link>
              ) : (
                <span className="academy-menu-disabled">{location.name}</span>
              )}
              <span className="academy-menu-state">
                {location.recommended
                  ? "Recommended"
                  : location.state === "locked"
                    ? "Locked - coming soon"
                    : "Available"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </nav>
  );
}
