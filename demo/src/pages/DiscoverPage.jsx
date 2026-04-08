import { useMemo, useState } from "react";

const ONBOARDING_STORAGE_KEY = "climbquest_onboarding_preferences";

// Mock route data for the recommendation cards.
const mockRoutes = [
  {
    id: "route-1",
    name: "Sunrise Slab Flow",
    difficulty: "Easy",
    style: "Balance",
    description: "A calm slab route focused on smooth footwork and body control.",
    matchRules: { level: "Beginner", style: "Balance", goal: "Learn" }
  },
  {
    id: "route-2",
    name: "Core Burst Traverse",
    difficulty: "Medium",
    style: "Strength",
    description: "A short but punchy traverse with power-focused movement.",
    matchRules: { level: "Intermediate", style: "Strength", goal: "Challenge" }
  },
  {
    id: "route-3",
    name: "Endurance Ladder",
    difficulty: "Medium",
    style: "Endurance",
    description: "Long sequence climbing to build pacing and stamina.",
    matchRules: {
      level: "Intermediate",
      style: "Endurance",
      goal: "Improve technique"
    }
  },
  {
    id: "route-4",
    name: "Technique Maze",
    difficulty: "Hard",
    style: "Technique",
    description: "Precision-heavy moves that reward patience and smart sequencing.",
    matchRules: { level: "Advanced", style: "Technique", goal: "Improve technique" }
  },
  {
    id: "route-5",
    name: "Fun Team Circuit",
    difficulty: "Easy",
    style: "Fun",
    description: "A social circuit designed for playful climbs with friends.",
    matchRules: { level: "Beginner", style: "Fun", goal: "Socialize" }
  }
];

function readUserPreferences() {
  try {
    const rawValue = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!rawValue) return { level: "", style: "", goal: "" };

    const parsed = JSON.parse(rawValue);
    return {
      level: parsed.level || "",
      style: parsed.style || "",
      goal: parsed.goal || ""
    };
  } catch {
    return { level: "", style: "", goal: "" };
  }
}

function scoreRoute(route, preferences) {
  let score = 0;

  if (route.matchRules.level === preferences.level) score += 2;
  if (route.matchRules.style === preferences.style) score += 2;
  if (route.matchRules.goal === preferences.goal) score += 2;

  return score;
}

function buildReason(route, preferences) {
  const reasons = [];

  if (preferences.level && route.matchRules.level === preferences.level) {
    reasons.push(`matches your ${preferences.level} level`);
  }
  if (preferences.style && route.matchRules.style === preferences.style) {
    reasons.push(`fits your ${preferences.style.toLowerCase()} style`);
  }
  if (preferences.goal && route.matchRules.goal === preferences.goal) {
    reasons.push(`supports your goal to ${preferences.goal.toLowerCase()}`);
  }

  if (reasons.length === 0) {
    return "Recommended as a fresh route to explore today.";
  }

  return `Recommended because it ${reasons.join(" and ")}.`;
}

function getStartProgressByDifficulty(difficulty) {
  if (difficulty === "Easy") return 30;
  if (difficulty === "Medium") return 20;
  return 12;
}

export default function DiscoverPage() {
  // Read onboarding preferences once for this page.
  const preferences = useMemo(() => readUserPreferences(), []);

  // Build the top 3 recommendations using simple scoring based on preferences.
  const recommendedRoutes = useMemo(() => {
    return [...mockRoutes]
      .sort(
        (a, b) => scoreRoute(b, preferences) - scoreRoute(a, preferences)
      )
      .slice(0, 3)
      .map((route) => ({
        ...route,
        recommendationReason: buildReason(route, preferences)
      }));
  }, [preferences]);

  // Track which route the user starts as today's active quest.
  const [activeQuestId, setActiveQuestId] = useState(null);
  const [challengeProgress, setChallengeProgress] = useState(0);

  const activeQuest = recommendedRoutes.find((route) => route.id === activeQuestId);

  function handleStartChallenge(route) {
    setActiveQuestId(route.id);
    setChallengeProgress(getStartProgressByDifficulty(route.difficulty));
  }

  return (
    <section className="cq-reco-page">
      <header className="cq-reco-header">
        <p className="cq-page-eyebrow">Discover</p>
        <h2>Welcome back, climber</h2>
        <p>
          Personalized recommendations based on your preferences and today&apos;s
          climbing vibe.
        </p>
      </header>

      {/* Conditional text: if we have onboarding choices, show the current profile summary. */}
      {(preferences.level || preferences.style || preferences.goal) && (
        <p className="cq-reco-profile-note">
          Your profile: {preferences.level || "Any level"} /{" "}
          {preferences.style || "Any style"} / {preferences.goal || "Any goal"}
        </p>
      )}

      <section className="cq-todays-quest" aria-label="Today's quest">
        <div className="cq-todays-quest-head">
          <h3>Today&apos;s Quest</h3>
          <span>{challengeProgress}%</span>
        </div>

        <p className="cq-todays-quest-title">
          {activeQuest ? activeQuest.name : "Choose a route to start your challenge"}
        </p>

        {/* Challenge progress bar updates when user starts a route. */}
        <div className="cq-quest-progress-track" aria-label="Challenge progress">
          <div
            className="cq-quest-progress-fill"
            style={{ width: `${challengeProgress}%` }}
          />
        </div>
      </section>

      <section className="cq-route-grid" aria-label="Recommended routes">
        {recommendedRoutes.map((route) => {
          const isActiveRoute = activeQuestId === route.id;

          return (
            <article key={route.id} className="cq-route-card">
              <div className="cq-route-top-row">
                <h3>{route.name}</h3>
                <span className="cq-route-difficulty">{route.difficulty}</span>
              </div>

              <span className="cq-route-style-tag">{route.style}</span>

              <p className="cq-route-description">{route.description}</p>
              <p className="cq-route-reason">{route.recommendationReason}</p>

              <button
                type="button"
                className="cq-primary-btn cq-route-btn"
                onClick={() => handleStartChallenge(route)}
                disabled={isActiveRoute}
              >
                {isActiveRoute ? "Challenge Started" : "Start Challenge"}
              </button>
            </article>
          );
        })}
      </section>
    </section>
  );
}
