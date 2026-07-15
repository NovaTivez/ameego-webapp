import { CharacterPortrait } from "@/components/CharacterPortrait";
import { PixelIcon } from "@/components/PixelIcon";
import { PixelRoomBackground } from "@/components/PixelRoomBackground";

export function FeedbackRoomScene() {
  return (
    <PixelRoomBackground
      variant="library"
      label="Pixel-art reflection room after interview completion"
      className="feedback-room-scene"
    >
      <div className="feedback-results-board" aria-hidden="true">
        <PixelIcon name="progress" size="large" />
        <span>REFLECT · LEARN · RETRY</span>
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="feedback-scene-character">
        <CharacterPortrait
          variant="student"
          name="Ari, reviewing the interview"
          compact
        />
      </div>
      <div className="feedback-trophy-shelf" aria-hidden="true">
        <span />
        <i />
        <i />
        <i />
      </div>
    </PixelRoomBackground>
  );
}
