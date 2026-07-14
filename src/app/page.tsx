import { AcademyMap } from "@/components/AcademyMap";
import { CharacterPortrait } from "@/components/CharacterPortrait";
import { PixelBadge } from "@/components/PixelBadge";
import { PixelDialog } from "@/components/PixelDialog";

export default function HomePage() {
  return (
    <div className="page-stack academy-page">
      <header className="academy-hero academy-hero-grid">
        <div>
          <PixelBadge tone="mint">Pixel Communication Academy</PixelBadge>
          <p className="eyebrow">Main campus directory</p>
          <h1 id="home-title">Choose where your communication grows next.</h1>
          <p className="hero-lede">
            Navigate the academy by campus map or accessible menu. Open locations lead to
            real routes; future rooms stay visibly locked until they are ready.
          </p>
        </div>
        <div className="academy-guide">
          <PixelDialog speaker="Campus guide">
            Start at the Interview Center, then return here whenever you need a new
            practice route.
          </PixelDialog>
          <CharacterPortrait variant="student" name="Ari, academy learner" compact />
        </div>
      </header>
      <AcademyMap />
    </div>
  );
}
