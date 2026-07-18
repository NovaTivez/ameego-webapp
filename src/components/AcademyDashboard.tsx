"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { PixelIcon, type PixelIconName } from "@/components/PixelIcon";
import {
  buildAcademyDashboardSnapshot,
  type AcademyDashboardSnapshot,
} from "@/lib/academy-dashboard";

import styles from "./academy-dashboard.module.css";

type DashboardState =
  | { status: "loading"; snapshot: null }
  | { status: "ready"; snapshot: AcademyDashboardSnapshot }
  | { status: "error"; snapshot: null };

const actionLinks: Array<{
  href: string;
  label: string;
  detail: string;
  icon: PixelIconName;
}> = [
  { href: "/learn", label: "Continue Learning", detail: "Open Courses", icon: "lesson" },
  {
    href: "/practice",
    label: "Practice Interview",
    detail: "Enter Simulator",
    icon: "speech",
  },
  { href: "/progress", label: "View Progress", detail: "Open Library", icon: "progress" },
  {
    href: "#achievements",
    label: "View Achievements",
    detail: "Badge Shelf",
    icon: "star",
  },
];

function formatDuration(minutes: number) {
  if (minutes <= 0) return "Complete";
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return `${minutes} min`;
  return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

function formatDate(value?: string) {
  if (!value) return "Date not stored";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function ScoreValue({ value }: { value: number | null }) {
  return value === null ? <strong>Not scored</strong> : <strong>{value}%</strong>;
}

export function AcademyDashboard() {
  const [state, setState] = useState<DashboardState>({
    status: "loading",
    snapshot: null,
  });

  const loadDashboard = useCallback(() => {
    try {
      setState({
        status: "ready",
        snapshot: buildAcademyDashboardSnapshot(window.localStorage),
      });
    } catch {
      setState({ status: "error", snapshot: null });
    }
  }, []);

  useEffect(() => {
    queueMicrotask(loadDashboard);
  }, [loadDashboard]);

  if (state.status === "loading") {
    return (
      <section className={styles.stateCard} aria-live="polite">
        <PixelIcon name="academy" size="large" />
        <h1>Loading Academy Hub…</h1>
        <p>Gathering your local progress, missions, and rewards.</p>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className={styles.stateCard} role="alert">
        <PixelIcon name="lock" size="large" />
        <h1>Academy records unavailable</h1>
        <p>Your locally saved progress could not be read. No records were changed.</p>
        <button
          className="pixel-button pixel-button-primary"
          type="button"
          onClick={loadDashboard}
        >
          Retry Dashboard
        </button>
      </section>
    );
  }

  const dashboard = state.snapshot;
  const nextRankXp = dashboard.nextRankMinimumXp
    ? Math.max(0, dashboard.nextRankMinimumXp - dashboard.totalXp)
    : 0;
  const latestAttemptLabel = dashboard.latestAttempt
    ? `${dashboard.latestAttempt.context.setup.role || "Practice role"} at ${dashboard.latestAttempt.context.setup.organization || "Practice organization"}`
    : "No interview attempt saved yet";
  const todayGoal = dashboard.currentLesson
    ? `Complete “${dashboard.currentLesson.title}”`
    : "Complete a graduation interview";
  const missions = [
    {
      title: "Complete one lesson",
      value: 0,
      target: 1,
      reward: "+50 XP",
      note: "Lesson records do not include completion dates yet.",
    },
    {
      title: "Finish one mock interview",
      value: Math.min(1, dashboard.todayInterviewCount),
      target: 1,
      reward: `+150 XP`,
      note: "Counted from timestamped interview attempts.",
    },
    {
      title: "Earn 100 XP",
      value: Math.min(100, dashboard.todayXp),
      target: 100,
      reward: "+25 XP bonus",
      note: "Tracks timestamped interview and feedback XP.",
    },
  ];

  return (
    <div className={styles.dashboardPage}>
      <section className={styles.hero} aria-labelledby="academy-dashboard-title">
        <div className={styles.heroGrid}>
          <div className={styles.welcomeBlock}>
            <p className={styles.eyebrow}>Main Building · Academy Command Center</p>
            <h1 id="academy-dashboard-title">
              Welcome back, <span>{dashboard.playerName}</span>
            </h1>
            <p className={styles.motivation}>
              One focused quest today can make your next interview answer clearer,
              stronger, and easier to trust.
            </p>
            <div className={styles.playerTags}>
              <span>Level {dashboard.level}</span>
              <span>{dashboard.currentRank}</span>
              <span>{dashboard.playerFocus}</span>
            </div>
          </div>

          <aside className={styles.goalCard} aria-label="Today's academy goal">
            <span>Today’s Goal</span>
            <strong>{todayGoal}</strong>
            <small>{dashboard.currentStreak} day current practice streak</small>
          </aside>
        </div>

        <div className={styles.xpPanel}>
          <div>
            <span>Rank XP</span>
            <strong>{dashboard.totalXp.toLocaleString()} XP</strong>
          </div>
          <div
            className={styles.progressBar}
            role="progressbar"
            aria-label={`${dashboard.currentRank} rank progress`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={dashboard.rankProgressPercent}
          >
            <span style={{ width: `${dashboard.rankProgressPercent}%` }} />
          </div>
          <small>
            {dashboard.nextRank
              ? `${nextRankXp} XP to ${dashboard.nextRank}`
              : "Highest academy rank reached"}
          </small>
        </div>

        <nav className={styles.quickActions} aria-label="Academy quick actions">
          {actionLinks.map((action) => (
            <Link href={action.href} key={action.label}>
              <PixelIcon name={action.icon} size="medium" />
              <span>
                <strong>{action.label}</strong>
                <small>{action.detail}</small>
              </span>
            </Link>
          ))}
        </nav>
      </section>

      <div className={styles.dashboardBody}>
        <section
          className={`${styles.panel} ${styles.journeyPanel}`}
          aria-labelledby="journey-title"
        >
          <header className={styles.sectionHeader}>
            <div>
              <p>Active Quest</p>
              <h2 id="journey-title">Continue Your Journey</h2>
            </div>
            <span>{dashboard.courseProgressPercent}%</span>
          </header>
          <div className={styles.journeyGrid}>
            <div className={styles.questCard}>
              <span>Current Course</span>
              <h3>Interview Skills Academy</h3>
              <p>{dashboard.currentLesson?.title ?? "Learning path complete"}</p>
              <div
                className={styles.progressBar}
                role="progressbar"
                aria-label="Interview Skills Academy completion"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={dashboard.courseProgressPercent}
              >
                <span style={{ width: `${dashboard.courseProgressPercent}%` }} />
              </div>
              <dl>
                <div>
                  <dt>Lessons</dt>
                  <dd>
                    {dashboard.completedLessonCount}/{dashboard.totalLessonCount}
                  </dd>
                </div>
                <div>
                  <dt>Time Left</dt>
                  <dd>{formatDuration(dashboard.remainingMinutes)}</dd>
                </div>
              </dl>
              <Link
                className="pixel-button pixel-button-primary"
                href={dashboard.currentLessonHref}
              >
                {dashboard.courseComplete ? "Start Final Interview" : "Continue Lesson"}
              </Link>
            </div>
            <div className={styles.questCard}>
              <span>Latest Interview Attempt</span>
              <h3>{latestAttemptLabel}</h3>
              <p>
                {dashboard.latestAttempt
                  ? `${formatDate(dashboard.latestAttempt.completedAt)} · ${dashboard.latestAttempt.evaluation ? "Validated feedback saved" : "Transcript saved"}`
                  : "The Interview Center is ready when you are."}
              </p>
              <dl>
                <div>
                  <dt>Sessions</dt>
                  <dd>{dashboard.interviewCount}</dd>
                </div>
                <div>
                  <dt>Evaluated</dt>
                  <dd>{dashboard.evaluatedInterviewCount}</dd>
                </div>
              </dl>
              <Link
                className="pixel-button pixel-button-secondary"
                href={dashboard.latestAttempt ? "/progress#attempt-history" : "/practice"}
              >
                {dashboard.latestAttempt ? "Review Attempt" : "Practice Interview"}
              </Link>
            </div>
          </div>
        </section>

        <section
          className={`${styles.panel} ${styles.missionsPanel}`}
          aria-labelledby="missions-title"
        >
          <header className={styles.sectionHeader}>
            <div>
              <p>Quest Board</p>
              <h2 id="missions-title">Daily Missions</h2>
            </div>
            <span>
              {missions.filter((mission) => mission.value >= mission.target).length}/3
            </span>
          </header>
          <ul className={styles.missionList}>
            {missions.map((mission) => {
              const completed = mission.value >= mission.target;
              const percent = Math.round((mission.value / mission.target) * 100);
              return (
                <li className={completed ? styles.completedItem : ""} key={mission.title}>
                  <PixelIcon name={completed ? "check" : "star"} size="small" />
                  <div>
                    <strong>{mission.title}</strong>
                    <small>{mission.note}</small>
                    <div
                      className={styles.missionProgress}
                      aria-label={`${mission.title}: ${mission.value} of ${mission.target}`}
                    >
                      <span style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                  <span>
                    {mission.value}/{mission.target}
                  </span>
                  <em>{mission.reward}</em>
                </li>
              );
            })}
          </ul>
        </section>

        <section
          className={`${styles.panel} ${styles.streakPanel}`}
          aria-labelledby="streak-title"
        >
          <header className={styles.sectionHeader}>
            <div>
              <p>Practice Rhythm</p>
              <h2 id="streak-title">Learning Streak</h2>
            </div>
            <PixelIcon name="timer" size="medium" />
          </header>
          <div className={styles.streakTotals}>
            <div>
              <strong>{dashboard.currentStreak}</strong>
              <span>Current streak</span>
            </div>
            <div>
              <strong>{dashboard.longestStreak}</strong>
              <span>Longest streak</span>
            </div>
          </div>
          <ol
            className={styles.weekCalendar}
            aria-label="Interview activity over the last seven days"
          >
            {dashboard.weeklyActivity.map((day) => (
              <li className={day.active ? styles.activeDay : ""} key={day.date}>
                <span>
                  {new Intl.DateTimeFormat("en", { weekday: "short" })
                    .format(new Date(day.date))
                    .slice(0, 1)}
                </span>
                <i
                  aria-label={
                    day.active ? "Interview completed" : "No timestamped interview"
                  }
                />
                <small>{day.isToday ? "Today" : new Date(day.date).getUTCDate()}</small>
              </li>
            ))}
          </ol>
          <p className={styles.dataNote}>
            Streaks use timestamped interview sessions. Lesson completion dates are not
            stored in the current progress record.
          </p>
        </section>

        <section
          className={`${styles.panel} ${styles.activityPanel}`}
          aria-labelledby="activity-title"
        >
          <header className={styles.sectionHeader}>
            <div>
              <p>Activity Log</p>
              <h2 id="activity-title">Recent Activity</h2>
            </div>
            <Link href="/progress">Open Library</Link>
          </header>
          {dashboard.recentActivity.length ? (
            <ul className={styles.activityList}>
              {dashboard.recentActivity.map((activity) => (
                <li key={activity.id}>
                  <PixelIcon
                    name={
                      activity.kind === "interview"
                        ? "speech"
                        : activity.kind === "lesson"
                          ? "lesson"
                          : "star"
                    }
                    size="small"
                  />
                  <div>
                    <strong>{activity.title}</strong>
                    <span>{activity.detail}</span>
                  </div>
                  <time>
                    {activity.occurredAt
                      ? formatDate(activity.occurredAt)
                      : "Saved locally"}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.emptyState}>
              <strong>Your activity log is ready.</strong>
              <p>Complete a lesson or mock interview to record your first milestone.</p>
            </div>
          )}
        </section>

        <section
          className={`${styles.panel} ${styles.statsPanel}`}
          aria-labelledby="statistics-title"
        >
          <header className={styles.sectionHeader}>
            <div>
              <p>At a Glance</p>
              <h2 id="statistics-title">Academy Statistics</h2>
            </div>
            <Link href="/progress">Detailed Progress</Link>
          </header>
          <div className={styles.statGrid}>
            <article>
              <span>Courses Completed</span>
              <strong>{dashboard.courseComplete ? 1 : 0}/1</strong>
              <small>Interview Skills Academy</small>
            </article>
            <article>
              <span>Interviews Completed</span>
              <strong>{dashboard.interviewCount}</strong>
              <small>{dashboard.evaluatedInterviewCount} with feedback</small>
            </article>
            <article>
              <span>Average Interview Score</span>
              <ScoreValue value={dashboard.averageInterviewScore} />
              <small>Across validated attempts</small>
            </article>
            <article>
              <span>Total Practice Time</span>
              <strong>Not tracked</strong>
              <small>Duration is not stored</small>
            </article>
            <article>
              <span>Latest STAR Score</span>
              <ScoreValue value={dashboard.latestStarScore} />
              <small>Latest validated rubric</small>
            </article>
            <article>
              <span>Communication Score</span>
              <strong>Not scored</strong>
              <small>No communication rubric stored</small>
            </article>
          </div>
        </section>

        <section
          id="achievements"
          className={`${styles.panel} ${styles.achievementsPanel}`}
          aria-labelledby="achievements-title"
        >
          <header className={styles.sectionHeader}>
            <div>
              <p>Badge Shelf</p>
              <h2 id="achievements-title">Achievements</h2>
            </div>
            <span>
              {dashboard.badges.filter((badge) => badge.unlocked).length}/
              {dashboard.badges.length}
            </span>
          </header>
          <ul className={styles.badgeGrid}>
            {dashboard.badges.map((badge) => (
              <li
                className={badge.unlocked ? styles.badgeUnlocked : styles.lockedItem}
                key={badge.name}
              >
                <PixelIcon name={badge.unlocked ? "star" : "lock"} size="large" />
                <strong>{badge.name}</strong>
                <span>{badge.unlocked ? "Unlocked" : badge.requirement}</span>
              </li>
            ))}
          </ul>
          <Link
            className="pixel-button pixel-button-secondary"
            href="/learn#academy-badges"
          >
            View All Achievements
          </Link>
        </section>

        <section
          className={`${styles.panel} ${styles.timelinePanel}`}
          aria-labelledby="journey-timeline-title"
        >
          <header className={styles.sectionHeader}>
            <div>
              <p>Milestone Path</p>
              <h2 id="journey-timeline-title">Career Journey</h2>
            </div>
          </header>
          <ol className={styles.timeline}>
            {dashboard.timeline.map((milestone) => (
              <li
                className={milestone.reached ? styles.timelineReached : styles.lockedItem}
                key={milestone.title}
              >
                <span className={styles.timelineMarker}>
                  <PixelIcon name={milestone.reached ? "check" : "lock"} size="small" />
                </span>
                <div>
                  <strong>{milestone.title}</strong>
                  <p>{milestone.detail}</p>
                  <small>
                    {milestone.occurredAt
                      ? formatDate(milestone.occurredAt)
                      : milestone.reached
                        ? "Reached · Date not stored"
                        : "Locked"}
                  </small>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          className={`${styles.panel} ${styles.certificatesPanel}`}
          aria-labelledby="certificates-title"
        >
          <header className={styles.sectionHeader}>
            <div>
              <p>Official Records</p>
              <h2 id="certificates-title">Certificates</h2>
            </div>
          </header>
          <ul className={styles.certificateList}>
            {dashboard.certificates.map((certificate) => (
              <li
                className={
                  certificate.earned ? styles.certificateEarned : styles.lockedItem
                }
                key={certificate.name}
              >
                <PixelIcon name={certificate.earned ? "resume" : "lock"} size="medium" />
                <div>
                  <strong>{certificate.name}</strong>
                  <span>
                    {certificate.earned
                      ? "Requirements complete"
                      : certificate.requirement}
                  </span>
                </div>
                <small>
                  {certificate.available
                    ? "Available"
                    : certificate.earned
                      ? "Issuance not available yet"
                      : "Locked"}
                </small>
                {certificate.available ? (
                  <div className={styles.certificateActions}>
                    <button type="button">View</button>
                    <button type="button">Download</button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section
          className={`${styles.panel} ${styles.rankPanel}`}
          aria-labelledby="rank-title"
        >
          <header className={styles.sectionHeader}>
            <div>
              <p>Academy Standing</p>
              <h2 id="rank-title">Rank Progression</h2>
            </div>
            <span>Level {dashboard.level}</span>
          </header>
          <div className={styles.rankSummary}>
            <div>
              <span>Current Rank</span>
              <strong>{dashboard.currentRank}</strong>
            </div>
            <PixelIcon name="back" size="medium" />
            <div>
              <span>Next Rank</span>
              <strong>{dashboard.nextRank ?? "Interview Master"}</strong>
            </div>
          </div>
          <div
            className={styles.progressBar}
            role="progressbar"
            aria-label="Progress to next academy rank"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={dashboard.rankProgressPercent}
          >
            <span style={{ width: `${dashboard.rankProgressPercent}%` }} />
          </div>
          <p>
            {dashboard.nextRank
              ? `${nextRankXp} XP required to reach ${dashboard.nextRank}.`
              : "You have reached the academy’s highest rank."}
          </p>
          <ol className={styles.rankPath}>
            {[
              "Recruit",
              "Candidate",
              "Professional",
              "Specialist",
              "Expert",
              "Interview Master",
            ].map((rankName, index) => (
              <li
                className={index + 1 <= dashboard.rankPosition ? styles.rankReached : ""}
                key={rankName}
              >
                <i />
                <span>{rankName}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
