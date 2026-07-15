import { PixelBadge } from "@/components/PixelBadge";
import { PixelButton } from "@/components/PixelButton";
import { PixelIcon } from "@/components/PixelIcon";
import type { AcademyLocation } from "@/lib/academy";

type PixelBuildingCardProps = { location: AcademyLocation };

const buildingIcons = {
  "interview-center": "building",
  "speech-hall": "speech",
  "progress-library": "progress",
} as const;

export function PixelBuildingCard({ location }: PixelBuildingCardProps) {
  const isLocked = location.state === "locked";
  return (
    <article
      className={`academy-location academy-location-${location.id} academy-location-${location.state}`}
      aria-labelledby={`${location.id}-title`}
    >
      <div className="academy-location-art" aria-hidden="true">
        <div className="academy-location-roof" />
        <div className="academy-location-building">
          <span className="academy-building-window window-left" />
          <span className="academy-building-door">
            <PixelIcon
              name={isLocked ? "lock" : buildingIcons[location.id]}
              size="small"
            />
          </span>
          <span className="academy-building-window window-right" />
        </div>
        <div className="academy-building-props">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="academy-location-copy">
        <div className="academy-location-statuses">
          <PixelBadge tone={isLocked ? "plum" : "mint"}>
            {isLocked ? "Locked" : "Available"}
          </PixelBadge>
          {location.recommended ? (
            <PixelBadge tone="amber">Recommended</PixelBadge>
          ) : null}
        </div>
        <p className="academy-location-label">{location.shortLabel}</p>
        <h3 id={`${location.id}-title`}>{location.name}</h3>
        <p>{location.description}</p>
        {location.href ? (
          <PixelButton href={location.href}>Enter {location.name}</PixelButton>
        ) : (
          <span className="academy-locked-note">
            {location.comingSoon ? "Coming soon" : "Unavailable"}
          </span>
        )}
      </div>
    </article>
  );
}
