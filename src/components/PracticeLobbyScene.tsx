import { CharacterPortrait } from "@/components/CharacterPortrait";
import { PixelDialog } from "@/components/PixelDialog";
import { PixelIcon } from "@/components/PixelIcon";
import { PixelRoomBackground } from "@/components/PixelRoomBackground";

type PracticeLobbySceneProps = {
  stage: "setup" | "resume" | "review" | "mode";
};

const messages = {
  setup: "Tell the desk what kind of conversation you want to rehearse.",
  resume: "A resume is optional. Only confirmed details enter the interview room.",
  review: "Check every note on the preparation board before generating questions.",
  mode: "Choose text or microphone. Every transcript remains editable before saving.",
} as const;

export function PracticeLobbyScene({ stage }: PracticeLobbySceneProps) {
  return (
    <PixelRoomBackground
      variant="office"
      label="Pixel-art Interview Center preparation lobby"
      className="practice-lobby-scene"
    >
      <div className="practice-lobby-dialog">
        <PixelDialog speaker="Interview Center host">{messages[stage]}</PixelDialog>
      </div>
      <div className="practice-lobby-character">
        <CharacterPortrait variant="student" name="Ari, preparing to interview" compact />
      </div>
      <div className="practice-filing-cabinet" aria-hidden="true">
        <span />
        <span />
        <PixelIcon name="resume" size="medium" />
      </div>
      <div className="practice-notice-board" aria-hidden="true">
        <span>PREP</span>
        <i />
        <i />
        <i />
      </div>
      <div className="practice-lobby-counter" aria-hidden="true">
        <PixelIcon name="microphone" size="large" />
        <span />
      </div>
    </PixelRoomBackground>
  );
}
