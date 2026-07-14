export function PixelRoom() {
  return (
    <figure className="pixel-room" aria-labelledby="room-caption">
      <div className="room-scene" aria-hidden="true">
        <div className="room-window">
          <span className="sky-pixel sky-pixel-one" />
          <span className="sky-pixel sky-pixel-two" />
          <span className="sky-pixel sky-pixel-three" />
        </div>
        <div className="wall-frame">
          <span />
          <span />
          <span />
        </div>
        <div className="plant">
          <span className="plant-leaf leaf-one" />
          <span className="plant-leaf leaf-two" />
          <span className="plant-leaf leaf-three" />
          <span className="plant-pot" />
        </div>
        <div className="person person-left">
          <span className="person-head" />
          <span className="person-body" />
        </div>
        <div className="person person-right">
          <span className="person-head" />
          <span className="person-body" />
        </div>
        <div className="room-table">
          <span className="table-top" />
          <span className="table-leg table-leg-left" />
          <span className="table-leg table-leg-right" />
          <span className="table-note" />
          <span className="table-mug" />
        </div>
        <div className="room-floor" />
      </div>
      <figcaption id="room-caption">
        A calm interview room where preparation meets possibility.
      </figcaption>
    </figure>
  );
}
