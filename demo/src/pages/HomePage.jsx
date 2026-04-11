import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

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
    title: "Volume Logic Maze",
    to: "/discover",
    note: "Technique warm-up suggestion"
  },
  {
    id: "quick-2",
    title: "Create a New DIY Line",
    to: "/create",
    note: "Best time to publish: evening"
  },
  {
    id: "quick-3",
    title: "Top Rated Community Route",
    to: "/community",
    note: "4.6 / 5 from 43 climbers"
  }
];

const communityDigest = [
  "Mia published a new slab route with 8 hold contours.",
  "Pulse Power Circuit got 6 new ratings today.",
  "3 teammates completed their first V2 challenge."
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

export default function HomePage() {
  const preferences = useMemo(() => readPreferences(), []);
  const [questProgress, setQuestProgress] = useState(22);
  const [questStarted, setQuestStarted] = useState(false);

  function handleStartQuest() {
    setQuestStarted(true);
    setQuestProgress((prev) => Math.max(prev, 36));
  }

  function handleLogMove() {
    setQuestProgress((prev) => Math.min(prev + 14, 100));
  }

  return (
    <section className="cq-home-page">
      <header className="cq-home-header">
        <p className="cq-page-eyebrow">Home</p>
        <h2>Welcome back, climber</h2>
        <p>
          Today focus: <strong>{preferences.style}</strong> / Goal:{" "}
          <strong>{preferences.goal}</strong>
        </p>
      </header>

      <section className="cq-home-quest-card" aria-label="Today's quest">
        <div className="cq-home-quest-head">
          <div>
            <p className="cq-home-section-label">Today&apos;s Quest</p>
            <h3>{todayQuest.name}</h3>
          </div>
          <span className="cq-route-difficulty">{todayQuest.difficulty}</span>
        </div>

        <p className="cq-route-description">{todayQuest.focus}</p>
        <p className="cq-route-reason">Estimated session: {todayQuest.estimate}</p>

        <div className="cq-quest-progress-track" aria-label="Quest progress">
          <div className="cq-quest-progress-fill" style={{ width: `${questProgress}%` }} />
        </div>
        <p className="cq-home-progress-text">{questProgress}% complete</p>

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
        <p>
          Retake the quiz anytime to refresh your profile and route recommendations based on your
          current mood.
        </p>
        <Link className="cq-primary-btn cq-home-inline-btn" to="/discover">
          Open Discover Quiz
        </Link>
      </section>

      <section className="cq-home-quick-grid" aria-label="Quick recommendations">
        {quickRecommendations.map((item) => (
          <Link key={item.id} className="cq-home-quick-card" to={item.to}>
            <h4>{item.title}</h4>
            <p>{item.note}</p>
          </Link>
        ))}
      </section>

      <section className="cq-home-feed-card" aria-label="Community digest">
        <p className="cq-home-section-label">Community Digest</p>
        <ul className="cq-home-feed-list">
          {communityDigest.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Link className="cq-secondary-btn cq-home-inline-btn" to="/community">
          View Community Feed
        </Link>
      </section>
    </section>
  );
}

