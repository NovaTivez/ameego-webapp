import { PixelLoadingState } from "@/components/PixelLoadingState";

export default function LearnLoading() {
  return (
    <div className="page-stack course-page" aria-busy="true">
      <div className="course-route-loading" role="status" aria-live="polite">
        <p className="eyebrow">Interview Foundations</p>
        <h1>Opening the lesson room...</h1>
        <PixelLoadingState label="Loading course" detail="Opening the lesson room" />
      </div>
    </div>
  );
}
