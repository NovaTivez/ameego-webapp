import Image from "next/image";

export function FeedbackRoomScene() {
  return (
    <section
      className="feedback-room-scene"
      aria-label="Panoramic Interview Center room after interview completion"
    >
      <Image
        className="feedback-complete-coach"
        src="/images/interview/mode-coach-desk.png"
        width={551}
        height={453}
        alt="Ameego interview coach seated behind a wooden desk"
      />
    </section>
  );
}
