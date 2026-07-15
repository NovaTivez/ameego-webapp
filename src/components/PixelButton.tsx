import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";

type PixelButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export function PixelButton({
  children,
  href,
  variant = "primary",
  type = "button",
  disabled,
  onClick,
}: PixelButtonProps) {
  const className = `pixel-button pixel-button-${variant}`;

  if (href) {
    return (
      <Link className={className} href={href}>
        <span>{children}</span>
        <span aria-hidden="true">-&gt;</span>
      </Link>
    );
  }

  return (
    <button className={className} type={type} disabled={disabled} onClick={onClick}>
      <span>{children}</span>
    </button>
  );
}
