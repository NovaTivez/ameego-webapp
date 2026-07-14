import { PixelLoadingState } from "@/components/PixelLoadingState";

export default function PracticeLoading() {
  return (
    <div className="page-stack route-page" role="status" aria-live="polite">
      <p className="eyebrow">Interview Center</p>
      <h1>Preparing the simulator...</h1>
      <p>Your interview context has not been submitted.</p>
      <PixelLoadingState
        label="Loading simulator"
        detail="Preparing a neutral interview room"
      />
    </div>
  );
}
