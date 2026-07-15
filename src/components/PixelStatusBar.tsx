import { PixelIcon, type PixelIconName } from "@/components/PixelIcon";

type PixelStatusBarProps = {
  label: string;
  value: string;
  tone?: "success" | "warning" | "danger" | "info";
  icon?: PixelIconName;
};

export function PixelStatusBar({
  label,
  value,
  tone = "info",
  icon = "check",
}: PixelStatusBarProps) {
  return (
    <div className={`pixel-status pixel-status-${tone}`}>
      <PixelIcon name={icon} size="small" />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
