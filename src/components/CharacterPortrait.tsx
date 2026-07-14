type CharacterPortraitProps = {
  variant: "interviewer" | "student";
  name: string;
  compact?: boolean;
};

export function CharacterPortrait({
  variant,
  name,
  compact = false,
}: CharacterPortraitProps) {
  return (
    <figure
      className={`character-portrait character-${variant}${compact ? " is-compact" : ""}`}
    >
      <svg
        viewBox="0 0 160 180"
        role="img"
        aria-label={`${name}, neutral pixel-art ${variant}`}
        shapeRendering="crispEdges"
      >
        <rect className="portrait-backdrop" x="8" y="8" width="144" height="164" />
        <rect className="portrait-hair" x="52" y="30" width="56" height="16" />
        <rect className="portrait-hair" x="40" y="42" width="80" height="32" />
        <rect className="portrait-skin" x="48" y="54" width="64" height="62" />
        <rect className="portrait-ear" x="40" y="70" width="8" height="24" />
        <rect className="portrait-ear" x="112" y="70" width="8" height="24" />
        <rect className="portrait-eye" x="60" y="76" width="8" height="8" />
        <rect className="portrait-eye" x="92" y="76" width="8" height="8" />
        <rect className="portrait-nose" x="76" y="84" width="8" height="12" />
        <rect className="portrait-mouth" x="68" y="102" width="24" height="6" />
        <rect className="portrait-neck" x="68" y="116" width="24" height="16" />
        <path className="portrait-jacket" d="M28 172v-26l26-22h52l26 22v26z" />
        <path className="portrait-shirt" d="M62 124h36l-18 30z" />
        <rect className="portrait-highlight" x="20" y="20" width="20" height="6" />
        <rect className="portrait-highlight" x="20" y="26" width="6" height="18" />
      </svg>
      <figcaption>{name}</figcaption>
    </figure>
  );
}
