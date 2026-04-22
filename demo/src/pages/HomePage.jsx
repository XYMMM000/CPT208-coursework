import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EXPERIENCE_MODES, useExperienceMode } from "../context/ExperienceModeContext";

const ONBOARDING_STORAGE_KEY = "climbquest_onboarding_preferences";

const todayQuest = {
  id: "today-quest-1",
  name: "Blue Slab Balance Route",
  difficulty: "Easy | V0-V1",
  focus: "Smooth feet and calm pacing",
  estimate: "18 min"
};

const quickRecommendations = [
  {
    id: "quick-1",
    icon: "Q",
    title: "Volume Logic Maze",
    to: "/discover",
    note: "Technique warm-up",
    status: "Quiz ready"
  },
  {
    id: "quick-2",
    icon: "C",
    title: "Create a New DIY Line",
    to: "/create",
    note: "Best publish slot",
    status: "Evening boost"
  },
  {
    id: "quick-3",
    icon: "F",
    title: "Top Rated Community Route",
    to: "/community",
    note: "4.6 / 5 from 43 climbers",
    status: "Trending"
  }
];

const communityDigest = [
  { id: "d1", title: "New slab route", detail: "Mia published an 8-hold line", time: "2m" },
  { id: "d2", title: "Ratings spike", detail: "Pulse Power Circuit got 6 ratings", time: "5m" },
  { id: "d3", title: "Team milestone", detail: "3 teammates sent first V2", time: "9m" }
];

function readPreferences() {
  try {
    const rawValue = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!rawValue) return { level: "Beginner", style: "Balance", goal: "Learn" };
    const parsed = JSON.parse(rawValue);
    return {
      level: parsed.level || "Beginner",
      style: parsed.style || "Balance",
      goal: parsed.goal || "Learn"
    };
  } catch {
    return { level: "Beginner", style: "Balance", goal: "Learn" };
  }
}

function getGuidedStep(questStarted, questProgress) {
  if (!questStarted) return { index: 1, title: "Start Today's Quest", desc: "Tap start and begin warm-up." };
  if (questProgress < 70) {
    return { index: 2, title: "Log One Movement", desc: "Record one progress point to keep momentum." };
  }
  return { index: 3, title: "Share and Review", desc: "Check community beta after your session." };
}

export default function HomePage() {
  const preferences = useMemo(() => readPreferences(), []);
  const { mode } = useExperienceMode();
  const [questProgress, setQuestProgress] = useState(22);
  const [questStarted, setQuestStarted] = useState(false);

  const isLite = mode === EXPERIENCE_MODES.LITE;
  const isGuided = mode === EXPERIENCE_MODES.GUIDED;
  const isImpact = mode === EXPERIENCE_MODES.IMPACT;

  const guidedStep = getGuidedStep(questStarted, questProgress);
  const guidedProgress = Math.round((guidedStep.index / 3) * 100);
  const streakDays = Math.max(2, Math.floor(questProgress / 18) + 1);

  function handleStartQuest() {
    setQuestStarted(true);
    setQuestProgress((prev) => Math.max(prev, 36));
  }

  function handleLogMove() {
    setQuestProgress((prev) => Math.min(prev + 14, 100));
  }

  return (
    <section className={`cq-home-page cq-home-page-${mode}`}>
      <header className="cq-home-header">
        <p className="cq-page-eyebrow">Home</p>
        <h2>Welcome back, climber</h2>

        <div className="cq-home-focus-chips" aria-label="Today's profile snapshot">
          <span className="cq-home-focus-chip">{preferences.level}</span>
          <span className="cq-home-focus-chip">{preferences.style}</span>
          <span className="cq-home-focus-chip">{preferences.goal}</span>
        </div>

        {!isLite && (
          <p>
            Today focus: <strong>{preferences.style}</strong> / Goal: <strong>{preferences.goal}</strong>
          </p>
        )}
      </header>

      {isGuided && (
        <section className="cq-home-guided-card" aria-label="Today's guided steps">
          <div className="cq-home-guided-head">
            <p className="cq-home-section-label">Step {guidedStep.index} / 3</p>
            <span>{guidedProgress}%</span>
          </div>
          <h3>{guidedStep.title}</h3>
          <p>{guidedStep.desc}</p>
          <div className="cq-quest-progress-track" aria-hidden="true">
            <div className="cq-quest-progress-fill" style={{ width: `${guidedProgress}%` }} />
          </div>
        </section>
      )}

      <section className="cq-home-quest-card" aria-label="Today's quest">
        <div className="cq-home-quest-head">
          <div>
            <p className="cq-home-section-label">Today's Quest</p>
            <h3>{todayQuest.name}</h3>
          </div>
          <span className="cq-route-difficulty">{todayQuest.difficulty}</span>
        </div>

        <div className="cq-home-quest-meta-row">
          <span className="cq-home-kpi-pill">{todayQuest.estimate}</span>
          <span className="cq-home-kpi-pill">{questProgress}% done</span>
          {isImpact && <span className="cq-home-kpi-pill cq-home-kpi-pill-hot">{streakDays} day streak</span>}
        </div>

        {!isLite && <p className="cq-route-description">{todayQuest.focus}</p>}

        <div className="cq-quest-progress-track" aria-label="Quest progress">
          <div className="cq-quest-progress-fill" style={{ width: `${questProgress}%` }} />
        </div>

        <div className="cq-home-progress-row">
          <p className="cq-home-progress-text">{questProgress}% complete</p>
          {isImpact && (
            <div
              className="cq-home-impact-ring"
              style={{ "--ring-progress": questProgress }}
              aria-label="Quest circular progress"
            >
              <span>{questProgress}%</span>
            </div>
          )}
        </div>

        <div className="cq-home-quest-actions">
          <button type="button" className="cq-primary-btn cq-home-btn" onClick={handleStartQuest}>
            {questStarted ? "Quest In Progress" : "Start Quest"}
          </button>
          <button type="button" className="cq-secondary-btn cq-home-btn" onClick={handleLogMove}>
            Log Progress
          </button>
        </div>
      </section>

      <section className="cq-home-coach-card" aria-label="Coach suggestion">
        <p className="cq-home-section-label">Coach Suggestion</p>
        <h3>Your climbing profile is ready</h3>
        {isLite ? (
          <div className="cq-home-coach-actions-lite">
            <Link className="cq-primary-btn cq-home-inline-btn" to="/discover">
              Retake Quiz
            </Link>
            <Link className="cq-secondary-btn cq-home-inline-btn" to="/community">
              View Picks
            </Link>
          </div>
        ) : (
          <>
            <p>
              Retake the quiz anytime to refresh your profile and route recommendations based on your
              current mood.
            </p>
            <Link className="cq-primary-btn cq-home-inline-btn" to="/discover">
              Open Discover Quiz
            </Link>
          </>
        )}
      </section>

      <section className="cq-home-quick-grid" aria-label="Quick recommendations">
        {quickRecommendations.map((item) => (
          <Link
            key={item.id}
            className={`cq-home-quick-card ${isImpact ? "cq-home-quick-card-impact" : ""}`}
            to={item.to}
          >
            <div className="cq-home-quick-head">
              <span className="cq-home-quick-icon">{item.icon}</span>
              <h4>{item.title}</h4>
            </div>
            <p>{isLite ? item.status : item.note}</p>
            {!isLite && <span className="cq-home-quick-status">{item.status}</span>}
          </Link>
        ))}
      </section>

      <section className="cq-home-feed-card" aria-label="Community digest">
        <p className="cq-home-section-label">Community Digest</p>
        {isLite || isImpact ? (
          <div className="cq-home-feed-cards">
            {communityDigest.map((item) => (
              <article key={item.id} className="cq-home-feed-item-card">
                <div className="cq-home-feed-item-head">
                  <h4>{item.title}</h4>
                  <span>{item.time}</span>
                </div>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        ) : (
          <ul className="cq-home-feed-list">
            {communityDigest.map((item) => (
              <li key={item.id}>{item.detail}</li>
            ))}
          </ul>
        )}
        <Link className="cq-secondary-btn cq-home-inline-btn" to="/community">
          View Community Feed
        </Link>
      </section>
    </section>
  );
}
