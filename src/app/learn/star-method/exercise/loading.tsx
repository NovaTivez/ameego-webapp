export default function ExerciseLoading() {
  return (
    <div className="page-stack exercise-page" aria-busy="true">
      <div className="course-route-loading" role="status" aria-live="polite">
        <p className="eyebrow">STAR arrangement exercise</p>
        <h1>Preparing the answer segments...</h1>
        <span className="sr-only">The STAR exercise is loading.</span>
      </div>
    </div>
  );
}
