import type { Metadata } from "next";
import Link from "next/link";

import { ExperienceControls } from "@/components/ExperienceControls";
import { PixelHudStat } from "@/components/PixelHudStat";
import { PixelIcon } from "@/components/PixelIcon";
import { TopLeftNavigation } from "@/components/TopLeftNavigation";

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
            <TopLeftNavigation className={styles.pageNavigation} />
            <h1 id="academy-hub-title">Ameego Academy</h1>
          </div>
          <div className={styles.headerControls} aria-label="Academy campus controls">
            <div className={styles.playerStatus} aria-label="Academy player status">
              <PixelHudStat label="XP" value="0000" icon="star" />
              <PixelHudStat label="LV" value="01" />
            </div>
            <ExperienceControls />
            <Link className={styles.settingsLink} href="/settings" aria-label="Settings">
              <PixelIcon name="settings" size="small" />
            </Link>
          </div>
        </header>

        <div className={styles.mapStage}>
          <AcademyCampusMap />
        </div>
      </section>
    </div>
  );
}
