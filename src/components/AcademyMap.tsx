import { AcademyLocationCard } from "@/components/AcademyLocationCard";
import { AcademyMenu } from "@/components/AcademyMenu";
import { PixelBadge } from "@/components/PixelBadge";
import { PixelButton } from "@/components/PixelButton";
import { PixelPanel } from "@/components/PixelPanel";
import { academyLocations } from "@/lib/academy";

const recommendedLocation = academyLocations.find((location) => location.recommended);

export function AcademyMap() {
  return (
    <>
      <section className="academy-recommendation" aria-labelledby="recommended-title">
        <div>
          <PixelBadge tone="amber">Recommended next</PixelBadge>
          <p className="eyebrow">Your guided starting point</p>
          <h2 id="recommended-title">Begin at the Interview Center.</h2>
          <p>
            The room is available now. Set up an interview, answer confirmed questions,
            and request evidence-based STAR feedback.
          </p>
        </div>
        {recommendedLocation?.href ? (
          <PixelButton href={recommendedLocation.href}>
            Go to Interview Center
          </PixelButton>
        ) : null}
      </section>

      <section className="academy-map-section" aria-labelledby="academy-map-title">
        <div className="academy-map-heading">
          <div>
            <p className="eyebrow">Campus map</p>
            <h2 id="academy-map-title">Three places. One communication journey.</h2>
          </div>
          <ul className="academy-status-legend" aria-label="Location status key">
            <li>
              <span className="legend-dot legend-available" />
              Available
            </li>
            <li>
              <span className="legend-dot legend-completed" />
              Completed
            </li>
            <li>
              <span className="legend-dot legend-recommended" />
              Recommended
            </li>
            <li>
              <span className="legend-dot legend-locked" />
              Locked
            </li>
          </ul>
        </div>

        <div className="academy-map" aria-label="Visual academy map">
          <div className="academy-world-sky" aria-hidden="true">
            <span className="academy-sun" />
            <span className="academy-cloud academy-cloud-one" />
            <span className="academy-cloud academy-cloud-two" />
            <span className="academy-mountain academy-mountain-one" />
            <span className="academy-mountain academy-mountain-two" />
          </div>
          <div className="academy-world-props" aria-hidden="true">
            <span className="campus-tree campus-tree-one" />
            <span className="campus-tree campus-tree-two" />
            <span className="campus-tree campus-tree-three" />
            <span className="campus-lamp campus-lamp-one" />
            <span className="campus-lamp campus-lamp-two" />
            <span className="campus-bench" />
            <span className="campus-fountain">
              <i />
            </span>
            <span className="campus-signpost">CAMPUS</span>
            <span className="campus-npc campus-npc-one">
              <i />
            </span>
            <span className="campus-npc campus-npc-two">
              <i />
            </span>
            <span className="campus-butterfly" />
          </div>
          <div className="academy-path academy-path-left" aria-hidden="true" />
          <div className="academy-path academy-path-right" aria-hidden="true" />
          {academyLocations.map((location) => (
            <AcademyLocationCard key={location.id} location={location} />
          ))}
        </div>
      </section>

      <PixelPanel tone="dark" className="academy-journey">
        <div className="academy-journey-item academy-journey-complete">
          <span className="journey-marker" aria-hidden="true">
            01
          </span>
          <div>
            <PixelBadge tone="mint">Completed</PixelBadge>
            <h3>Academy map discovered</h3>
            <p>You have reached the hub and can identify every MVP location.</p>
          </div>
        </div>
        <div className="academy-journey-divider" aria-hidden="true" />
        <div className="academy-journey-item">
          <span className="journey-marker" aria-hidden="true">
            02
          </span>
          <div>
            <PixelBadge tone="amber">Recommended</PixelBadge>
            <h3>Tour the Interview Center</h3>
            <p>
              No interview attempt or lesson completion is claimed by this checkpoint.
            </p>
          </div>
        </div>
      </PixelPanel>

      <AcademyMenu locations={academyLocations} />
    </>
  );
}
