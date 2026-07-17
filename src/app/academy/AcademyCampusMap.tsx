import Image from "next/image";
import Link from "next/link";

import styles from "./academy.module.css";

type CampusBuildingProps = {
  accessibleLabel: string;
  alt: string;
  className: string;
  height: number;
  href?: string;
  image: string;
  label: string;
  locked?: boolean;
  priority?: boolean;
  status?: string;
  width: number;
};

function CampusBuilding({
  accessibleLabel,
  alt,
  className,
  height,
  href,
  image,
  label,
  locked = false,
  priority = false,
  status,
  width,
}: CampusBuildingProps) {
  const content = (
    <>
      <span className={styles.contactShadow} aria-hidden="true" />
      <Image
        className={styles.buildingImage}
        src={image}
        alt={alt}
        width={width}
        height={height}
        sizes="(max-width: 520px) 24vw, (max-width: 760px) 22vw, 20vw"
        priority={priority}
        unoptimized
      />
      <span className={styles.locationLabel} aria-hidden="true">
        {label}
        {status ? <small>{status}</small> : null}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        className={`${styles.location} ${className}`}
        href={href}
        aria-label={accessibleLabel}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={`${styles.location} ${className} ${styles.lockedLocation}`}
      type="button"
      disabled={locked}
      aria-disabled={locked}
      aria-label={accessibleLabel}
      title="This feature is not yet available."
    >
      {content}
    </button>
  );
}

export function AcademyCampusMap() {
  return (
    <div className={styles.map} aria-label="Ameego Academy campus map">
      <Image
        className={styles.mapBackground}
        src="/images/academy/campus-map-v3.png"
        alt=""
        fill
        sizes="100vw"
        priority
        unoptimized
      />

      <CampusBuilding
        accessibleLabel="Open Main Building, Academy home"
        alt="Main Building"
        className={styles.mainBuilding}
        href="/academy/home"
        image="/images/academy/main-building-v2.png"
        label="Main Building"
        width={1536}
        height={1024}
        priority
      />
      <CampusBuilding
        accessibleLabel="Enter Interview Center"
        alt="Interview Center building"
        className={styles.interviewCenter}
        href="/practice"
        image="/images/academy/interview-center-v2.png"
        label="Interview Center"
        width={612}
        height={408}
        priority
      />
      <CampusBuilding
        accessibleLabel="Speech Hall, locked, coming soon"
        alt="Speech Hall building"
        className={styles.speechHall}
        image="/images/academy/speech-hall-v2.png"
        label="Speech Hall"
        locked
        status="Coming Soon"
        width={1536}
        height={1024}
      />
      <CampusBuilding
        accessibleLabel="Open Progress Library"
        alt="Progress Library building"
        className={styles.progressLibrary}
        href="/progress"
        image="/images/academy/progress-library-v2.png"
        label="Progress Library"
        width={612}
        height={408}
      />
      <CampusBuilding
        accessibleLabel="Open Courses Building"
        alt="Courses Building"
        className={styles.coursesBuilding}
        href="/learn"
        image="/images/academy/courses-building-v2.png"
        label="Courses"
        width={1536}
        height={1024}
      />
    </div>
  );
}
