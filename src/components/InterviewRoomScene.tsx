import Image from "next/image";

import styles from "./interview-session.module.css";

type InterviewRoomSceneProps = {
  category: string;
  question: string;
};

export function InterviewRoomScene({ category, question }: InterviewRoomSceneProps) {
  return (
    <section className={styles.room} aria-label="Pixel interview room">
      <Image
        className={styles.roomBackground}
        src="/images/interview/header-panorama.png"
        width={2119}
        height={742}
        alt=""
        aria-hidden="true"
        priority
      />
      <div className={styles.roomShade} aria-hidden="true" />
      <div className={styles.questionBubble}>
        <span>{category.replaceAll("_", " ")}</span>
        <h2>{question}</h2>
      </div>
      <Image
        className={styles.interviewer}
        src="/images/interview/mode-coach-desk.png"
        width={551}
        height={453}
        alt="Ameego interview coach seated behind a wooden desk"
        priority
      />
      <div className={styles.stageVignette} aria-hidden="true" />
    </section>
  );
}
