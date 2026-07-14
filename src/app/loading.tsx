import { PixelLoadingState } from "@/components/PixelLoadingState";

export default function Loading() {
  return (
    <div className="page-stack state-page" aria-busy="true" aria-live="polite">
      <p className="eyebrow">Preparing the room</p>
      <h1>Setting the scene...</h1>
      <PixelLoadingState label="Loading academy room" detail="Arranging the scene" />
      <span className="sr-only">The next page is loading.</span>
    </div>
  );
}
