import type { Metadata } from "next";
import type { ReactNode } from "react";

import { MainNav } from "@/components/MainNav";
import { GameWorldBackdrop } from "@/components/GameWorldBackdrop";

import "./globals.css";
import "./pixel-system.css";

export const metadata: Metadata = {
  title: {
    default: "Ameego | Interview practice",
    template: "%s | Ameego",
  },
  description: "Build clear STAR interview stories, one focused practice at a time.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <GameWorldBackdrop />
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <div className="site-shell">
          <MainNav />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <footer className="site-footer">
            <span>Ameego learning lab</span>
            <span aria-hidden="true">{"//"}</span>
            <span>Pixel academy system online</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
