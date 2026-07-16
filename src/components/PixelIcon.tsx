export type PixelIconName =
  | "academy"
  | "back"
  | "building"
  | "camera"
  | "check"
  | "lesson"
  | "lock"
  | "microphone"
  | "music"
  | "muted"
  | "progress"
  | "resume"
  | "settings"
  | "speech"
  | "star"
  | "timer";

type PixelIconProps = {
  name: PixelIconName;
  label?: string;
  size?: "small" | "medium" | "large";
};

const shapes: Record<PixelIconName, React.ReactNode> = {
  academy: (
    <>
      <path d="M3 8h18v3H3zM5 12h3v8H5zm6 0h3v8h-3zm6 0h3v8h-3zM2 20h20v3H2z" />
      <path d="M5 6h14v2H5zM8 3h8v3H8z" />
    </>
  ),
  back: <path d="M9 3h5v4h7v4h-7v3h7v4h-7v3H9v-4H6v-3H3V9h3V6h3z" />,
  building: <path d="M3 8h18v14H3zM6 3h12v5H6zm1 9h3v3H7zm7 0h3v3h-3zM10 17h4v5h-4z" />,
  camera: <path d="M2 7h14v12H2zM16 10l6-3v12l-6-3zM6 4h6v3H6zm1 7h4v4H7z" />,
  check: <path d="M2 12h5v5h4v4h5v-5h3v-5h3V6h-5v5h-3v4h-2v-3H7V9H2z" />,
  lesson: (
    <path d="M3 3h8v18H3zM13 3h8v18h-8zM6 7h3v2H6zm0 5h3v2H6zm10-5h3v2h-3zm0 5h3v2h-3zM9 4h6v16H9z" />
  ),
  lock: (
    <path d="M5 10h14v12H5zM8 5h2V3h4v2h2v5h3V5h-2V2h-2V0H9v2H7v3H5zM11 14h3v5h-3z" />
  ),
  microphone: (
    <path d="M8 2h8v12H8zM5 9h3v6h2v2h4v-2h2V9h3v7h-2v3h-4v3h4v2H7v-2h4v-3H8v-2H5z" />
  ),
  music: (
    <path d="M15 2h7v14h-3V7h-6v11h-2v3H5v-2H3v-4h2v-2h5V5h5zm-9 13v4h4v-4zm9-10h4V4h-4z" />
  ),
  muted: <path d="M3 9h4l5-5v16l-5-5H3zm12-3h3v3h3v3h-3v3h3v3h-3v-3h-3v-3h3V9h-3z" />,
  progress: <path d="M3 19h4v4H3zm0-7h8v4H3zm0-7h13v4H3zm16-2h3v20h-3z" />,
  resume: (
    <path d="M4 1h11l5 5v17H4zM14 2v6h5M7 11h10v2H7zm0 4h10v2H7zm0 4h7v2H7zM7 5h4v4H7z" />
  ),
  settings: (
    <path d="M9 1h6v3h4v4h3v8h-3v4h-4v3H9v-3H5v-4H2V8h3V4h4zm3 7h-2v2H8v4h2v2h4v-2h2v-4h-2V8z" />
  ),
  speech: <path d="M2 3h20v14H9l-5 5v-5H2zM6 7h3v3H6zm5 0h3v3h-3zm5 0h3v3h-3z" />,
  star: <path d="M9 1h6v5h5v5h3v5h-6v7H7v-7H1v-5h3V6h5zM10 8h4v4h-4z" />,
  timer: (
    <path d="M9 1h6v3H9zM7 4h10v2h3v3h2v10h-2v3h-3v2H7v-2H4v-3H2V9h2V6h3zm4 4h3v6h4v3h-7z" />
  ),
};

export function PixelIcon({ name, label, size = "medium" }: PixelIconProps) {
  return (
    <svg
      className={`pixel-icon pixel-icon-${size}`}
      viewBox="0 0 24 24"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      shapeRendering="crispEdges"
    >
      {shapes[name]}
    </svg>
  );
}
