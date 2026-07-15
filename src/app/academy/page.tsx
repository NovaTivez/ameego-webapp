import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { PixelHudStat } from "@/components/PixelHudStat";
import { PixelIcon } from "@/components/PixelIcon";

import styles from "./academy.module.css";

export const metadata: Metadata = {
  title: "Academy Hub",
  description: "Explore the Ameego Pixel Communication Academy campus.",
};

const trees = [
  [5, 18],
  [11, 28],
  [18, 13],
  [27, 21],
  [72, 16],
  [84, 12],
  [91, 25],
  [6, 62],
  [14, 77],
  [28, 72],
  [76, 75],
  [88, 63],
  [94, 79],
];

const lamps = [
  [34, 28],
  [62, 30],
  [43, 56],
  [59, 58],
  [34, 79],
  [68, 78],
];

const texturePixels = [
  [4, 8],
  [10, 42],
  [17, 56],
  [22, 32],
  [30, 9],
  [37, 44],
  [45, 17],
  [52, 38],
  [58, 12],
  [65, 47],
  [72, 35],
  [79, 7],
  [85, 49],
  [91, 40],
  [96, 15],
  [3, 88],
  [12, 69],
  [23, 91],
  [39, 84],
  [48, 70],
  [57, 91],
  [67, 68],
  [81, 88],
  [92, 94],
];

const flowers = [
  [8, 48],
  [15, 44],
  [23, 80],
  [31, 63],
  [69, 68],
  [78, 42],
  [87, 52],
  [92, 86],
];

const benches = [
  [36, 66],
  [64, 66],
];

const campusNeighbors = [
  [48, 44],
  [55, 72],
  [72, 54],
];

function PositionedItem({
  className,
  position,
}: {
  className: string;
  position: number[];
}) {
  return (
    <span
      className={className}
      style={
        {
          "--item-left": `${position[0]}%`,
          "--item-top": `${position[1]}%`,
        } as CSSProperties
      }
    />
  );
}

function BuildingArt({ windows = 5 }: { windows?: number }) {
  return (
    <span className={styles.buildingArt} aria-hidden="true">
      <span className={styles.roof} />
      <span className={styles.upperFloor}>
        {Array.from({ length: windows }, (_, index) => (
          <i key={index} />
        ))}
      </span>
      <span className={styles.lowerFloor}>
        <i />
        <i className={styles.door} />
        <i />
      </span>
      <span className={styles.steps} />
    </span>
  );
}

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

        <div className={styles.map} aria-label="Ameego Academy campus map">
          <div className={styles.terrain} aria-hidden="true">
            <span className={`${styles.grassPatch} ${styles.grassPatchOne}`} />
            <span className={`${styles.grassPatch} ${styles.grassPatchTwo}`} />
            <span className={`${styles.grassPatch} ${styles.grassPatchThree}`} />
            <span className={`${styles.path} ${styles.pathVertical}`} />
            <span className={`${styles.path} ${styles.pathHorizontal}`} />
            <span className={`${styles.path} ${styles.pathInterview}`} />
            <span className={`${styles.path} ${styles.pathSpeech}`} />
            <span className={`${styles.path} ${styles.pathLibrary}`} />
            <span className={styles.plaza} />
            <span className={styles.pond} />
            <span className={`${styles.fence} ${styles.fenceNorth}`} />
            <span className={`${styles.fence} ${styles.fenceEast}`} />
            {texturePixels.map((position, index) => (
              <PositionedItem
                key={`texture-${index}`}
                className={styles.texturePixel}
                position={position}
              />
            ))}
            {trees.map((position, index) => (
              <PositionedItem
                key={`tree-${index}`}
                className={styles.tree}
                position={position}
              />
            ))}
            {lamps.map((position, index) => (
              <PositionedItem
                key={`lamp-${index}`}
                className={styles.lamp}
                position={position}
              />
            ))}
            {flowers.map((position, index) => (
              <PositionedItem
                key={`flower-${index}`}
                className={styles.flower}
                position={position}
              />
            ))}
            {benches.map((position, index) => (
              <PositionedItem
                key={`bench-${index}`}
                className={styles.bench}
                position={position}
              />
            ))}
            {campusNeighbors.map((position, index) => (
              <PositionedItem
                key={`neighbor-${index}`}
                className={styles.campusNeighbor}
                position={position}
              />
            ))}
            <span className={`${styles.banner} ${styles.bannerLeft}`} />
            <span className={`${styles.banner} ${styles.bannerRight}`} />
          </div>

          <Link
            className={`${styles.location} ${styles.interviewCenter}`}
            href="/practice"
            aria-label="Enter Interview Center"
          >
            <span className={styles.recommendedMarker} aria-hidden="true">
              !
            </span>
            <BuildingArt windows={6} />
            <span className={styles.locationSign}>Interview Center</span>
          </Link>

          <section
            className={`${styles.location} ${styles.speechHall}`}
            aria-labelledby="speech-hall-label"
          >
            <BuildingArt windows={5} />
            <span id="speech-hall-label" className={styles.locationSign}>
              Speech Hall
              <small>Coming Soon</small>
            </span>
          </section>

          <Link
            className={`${styles.location} ${styles.progressLibrary}`}
            href="/progress"
            aria-label="Open Progress Library"
          >
            <BuildingArt windows={4} />
            <span className={styles.locationSign}>Progress Library</span>
          </Link>

          <section className={styles.courtyard} aria-labelledby="courtyard-label">
            <span className={styles.fountain} aria-hidden="true">
              <i />
            </span>
            <span id="courtyard-label" className={styles.locationSign}>
              Courtyard
            </span>
          </section>

          <span className={`${styles.mapSign} ${styles.courseSign}`} aria-hidden="true">
            Courses →
          </span>
          <span className={`${styles.mapSign} ${styles.practiceSign}`} aria-hidden="true">
            Practice ↑
          </span>
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
