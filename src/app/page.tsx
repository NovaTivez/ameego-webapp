import { PixelButton } from "@/components/PixelButton";

import styles from "./landing.module.css";

function WindowGrid({ count }: { count: number }) {
  return (
    <div className={styles.windowGrid}>
      {Array.from({ length: count }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className={`landing-title-screen ${styles.screen}`}>
      <section className={styles.frame} aria-labelledby="landing-title">
        <div className={styles.sky} aria-hidden="true">
          <div className={styles.stars}>
            {Array.from({ length: 18 }, (_, index) => (
              <i key={index} />
            ))}
          </div>
          <span className={styles.moon} />
          <span className={`${styles.cloud} ${styles.cloudLeft}`} />
          <span className={`${styles.cloud} ${styles.cloudRight}`} />
          <span className={`${styles.hill} ${styles.hillBack}`} />
          <span className={`${styles.hill} ${styles.hillFront}`} />
        </div>

        <div className={styles.academy} aria-hidden="true">
          <div className={`${styles.building} ${styles.leftBuilding}`}>
            <span className={styles.roof} />
            <span className={styles.chimney} />
            <WindowGrid count={6} />
            <span className={styles.door} />
          </div>
          <div className={`${styles.building} ${styles.centerBuilding}`}>
            <span className={styles.clockRoof} />
            <span className={styles.clock}>A</span>
            <WindowGrid count={8} />
            <span className={styles.mainDoor} />
          </div>
          <div className={`${styles.building} ${styles.rightBuilding}`}>
            <span className={styles.roof} />
            <WindowGrid count={6} />
            <span className={styles.door} />
          </div>
          <span className={styles.path} />
          <div className={styles.trees}>
            {Array.from({ length: 8 }, (_, index) => (
              <span key={index} className={styles.tree} />
            ))}
          </div>
          <div className={styles.lamps}>
            {Array.from({ length: 4 }, (_, index) => (
              <span key={index} className={styles.lamp} />
            ))}
          </div>
          <div className={styles.shrubs}>
            {Array.from({ length: 12 }, (_, index) => (
              <span key={index} />
            ))}
          </div>
        </div>

        <div className={styles.titleCard}>
          <p className={styles.kicker}>Pixel Communication Academy</p>
          <h1 id="landing-title" className={styles.logo}>
            Ameego
          </h1>
          <p className={styles.tagline}>
            <span>Level up your communication.</span>
            <span>Ace every interview.</span>
            <span>Unlock your future.</span>
          </p>
          <div className={styles.enterAction}>
            <PixelButton href="/academy">
              <span className="sr-only">Start Learning: </span>
              Enter Academy
            </PixelButton>
          </div>
        </div>

        <p className={styles.systemLabel}>Ameego Academy · System Ready</p>
      </section>
    </div>
  );
}
