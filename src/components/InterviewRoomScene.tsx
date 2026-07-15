import { CharacterPortrait } from "@/components/CharacterPortrait";

import styles from "./interview-session.module.css";

type InterviewRoomSceneProps = {
  category: string;
  question: string;
};

export function InterviewRoomScene({ category, question }: InterviewRoomSceneProps) {
  return (
    <section className={styles.room} aria-label="Pixel interview room">
      <div className={styles.wallTexture} aria-hidden="true" />
      <div className={styles.window} aria-hidden="true">
        <span className={styles.windowStarOne} />
        <span className={styles.windowStarTwo} />
        <span className={styles.windowMoon} />
        <span className={styles.skylineOne} />
        <span className={styles.skylineTwo} />
        <span className={styles.windowSill} />
      </div>
      <div className={styles.certificate} aria-hidden="true">
        <span />
      </div>
      <div className={styles.academyPennant} aria-hidden="true">
        A
      </div>
      <div className={styles.bookshelf} aria-hidden="true">
        <span className={styles.bookOne} />
        <span className={styles.bookTwo} />
        <span className={styles.bookThree} />
        <span className={styles.bookFour} />
        <span className={styles.shelfPlant} />
      </div>
      <div className={styles.floorPlant} aria-hidden="true">
        <span className={styles.plantLeafOne} />
        <span className={styles.plantLeafTwo} />
        <span className={styles.plantLeafThree} />
        <span className={styles.plantPot} />
      </div>
      <div className={styles.questionBubble}>
        <span>{category.replaceAll("_", " ")}</span>
        <h2>{question}</h2>
      </div>
      <div className={styles.interviewer}>
        <CharacterPortrait variant="interviewer" name="Jordan, interviewer" />
      </div>
      <div className={styles.desk} aria-hidden="true">
        <span className={styles.deskTop} />
        <span className={styles.deskFront} />
        <span className={styles.deskLegLeft} />
        <span className={styles.deskLegRight} />
        <span className={styles.deskPaper} />
        <span className={styles.deskMug} />
        <span className={styles.deskLamp} />
        <span className={styles.deskFolder} />
        <span className={styles.deskPen} />
      </div>
      <div className={styles.roomRug} aria-hidden="true" />
      <div className={styles.floorTexture} aria-hidden="true" />
    </section>
  );
}
