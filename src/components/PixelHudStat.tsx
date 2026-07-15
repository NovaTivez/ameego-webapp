import { PixelIcon, type PixelIconName } from "@/components/PixelIcon";

type PixelHudStatProps = {
  label: string;
  value: string;
  icon?: PixelIconName;
};

export function PixelHudStat({ label, value, icon }: PixelHudStatProps) {
  return (
    <span className="pixel-hud-stat">
      {icon ? <PixelIcon name={icon} size="small" /> : null}
      <span>{label}</span>
      <strong>{value}</strong>
    </span>
  );
}
