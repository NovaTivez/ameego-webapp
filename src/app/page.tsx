import Link from "next/link";

import styles from "./landing.module.css";

export default function HomePage() {
  return (
    <div className={`landing-title-screen ${styles.screen}`}>
      <section className={styles.frame} aria-labelledby="landing-title">
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
            <Link
              className={styles.enterButton}
              href="/academy"
              aria-label="Start Learning: Enter Academy"
            >
              <span>Enter Academy</span>
            </Link>
          </div>
        </div>

        <p className={styles.systemLabel}>Ameego Academy · System Ready</p>
      </section>
    </div>
  );
}
