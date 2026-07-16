import type { Metadata } from "next";
import Link from "next/link";

import { PixelHudStat } from "@/components/PixelHudStat";
import { PixelIcon } from "@/components/PixelIcon";

import { AcademyCampusMap } from "./AcademyCampusMap";
import styles from "./academy.module.css";

export const metadata: Metadata = {
  title: "Academy Hub",
  description: "Explore the Ameego Pixel Communication Academy campus.",
};

export default function AcademyHubPage() {
  return (
    <div className={`academy-hub-screen ${styles.screen}`}>
      <section className={styles.frame} aria-labelledby="academy-hub-title">
        <header className={styles.hud}>
          <div className={styles.identity}>
            <Link className={styles.backLink} href="/" aria-label="Back to title screen">
              <PixelIcon name="back" size="small" />
            </Link>
            <h1 id="academy-hub-title">Ameego Academy</h1>
          </div>
          <div className={styles.playerStatus} aria-label="Academy player status">
            <PixelHudStat label="XP" value="0000" icon="star" />
            <PixelHudStat label="LV" value="01" />
          </div>
        </header>

        <div className={styles.mapStage}>
          <AcademyCampusMap />
        </div>

        <nav className={styles.bottomNav} aria-label="Academy shortcuts">
          <Link href="/learn">
            <PixelIcon name="lesson" size="small" />
            <span>Courses</span>
          </Link>
          <Link href="/progress">
            <PixelIcon name="progress" size="small" />
            <span>Progress</span>
          </Link>
          <Link href="/settings">
            <PixelIcon name="settings" size="small" />
            <span>Settings</span>
          </Link>
        </nav>
      </section>
    </div>
  );
}
