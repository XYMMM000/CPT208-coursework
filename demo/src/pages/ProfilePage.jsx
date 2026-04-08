import { useMemo } from "react";

const mockProfile = {
  username: "ClimbNova",
  weeklyClimbingCount: 4,
  completedChallenges: 12,
  earnedBadges: ["First Send", "Footwork Focus", "Route Creator", "Community Helper"],
  savedRoutes: 9,
  recentActivity: [
    "Completed 'Blue Slab Balance Route'",
    "Saved 'Tempo Traverse' to Favorites",
    "Posted feedback on 'Neon Ladder'",
    "Created route 'Moonlight Traverse'"
  ],
  growth: {
    monthlyGoalSessions: 16,
    currentSessions: 11,
    techniqueLevel: 68,
    enduranceLevel: 54,
    confidenceLevel: 73
  }
};

function getProgressPercent(current, total) {
  if (!total) return 0;
  return Math.min(Math.round((current / total) * 100), 100);
}

export default function ProfilePage() {
  // Derived progress values keep the JSX clean and easier for beginners to read.
  const monthlyProgress = useMemo(
    () =>
      getProgressPercent(
        mockProfile.growth.currentSessions,
        mockProfile.growth.monthlyGoalSessions
      ),
    []
  );

  return (
    <section className="cq-profile-page">
      <header className="cq-profile-header">
        <p className="cq-page-eyebrow">Profile</p>
        <h2>{mockProfile.username}</h2>
        <p>Keep climbing, keep growing. You are building strong momentum this week.</p>
      </header>

      <section className="cq-profile-stats" aria-label="Profile stats">
        <article className="cq-profile-stat-card">
          <p>Weekly climbs</p>
          <h3>{mockProfile.weeklyClimbingCount}</h3>
        </article>
        <article className="cq-profile-stat-card">
          <p>Completed challenges</p>
          <h3>{mockProfile.completedChallenges}</h3>
        </article>
        <article className="cq-profile-stat-card">
          <p>Earned badges</p>
          <h3>{mockProfile.earnedBadges.length}</h3>
        </article>
        <article className="cq-profile-stat-card">
          <p>Saved routes</p>
          <h3>{mockProfile.savedRoutes}</h3>
        </article>
      </section>

      <section className="cq-profile-card" aria-label="Climbing growth">
        <h3>Climbing Growth</h3>

        <div className="cq-profile-progress-block">
          <div className="cq-profile-progress-head">
            <span>Monthly climbing goal</span>
            <span>
              {mockProfile.growth.currentSessions}/{mockProfile.growth.monthlyGoalSessions}
            </span>
          </div>
          <div className="cq-quest-progress-track">
            <div
              className="cq-quest-progress-fill"
              style={{ width: `${monthlyProgress}%` }}
            />
          </div>
        </div>

        {/* Skill progress bars make growth areas easy to scan on mobile. */}
        <div className="cq-profile-progress-block">
          <div className="cq-profile-progress-head">
            <span>Technique</span>
            <span>{mockProfile.growth.techniqueLevel}%</span>
          </div>
          <div className="cq-quest-progress-track">
            <div
              className="cq-quest-progress-fill"
              style={{ width: `${mockProfile.growth.techniqueLevel}%` }}
            />
          </div>
        </div>

        <div className="cq-profile-progress-block">
          <div className="cq-profile-progress-head">
            <span>Endurance</span>
            <span>{mockProfile.growth.enduranceLevel}%</span>
          </div>
          <div className="cq-quest-progress-track">
            <div
              className="cq-quest-progress-fill"
              style={{ width: `${mockProfile.growth.enduranceLevel}%` }}
            />
          </div>
        </div>

        <div className="cq-profile-progress-block">
          <div className="cq-profile-progress-head">
            <span>Confidence</span>
            <span>{mockProfile.growth.confidenceLevel}%</span>
          </div>
          <div className="cq-quest-progress-track">
            <div
              className="cq-quest-progress-fill"
              style={{ width: `${mockProfile.growth.confidenceLevel}%` }}
            />
          </div>
        </div>
      </section>

      <section className="cq-profile-card" aria-label="Earned badges">
        <h3>Earned Badges</h3>
        <div className="cq-profile-badge-row">
          {mockProfile.earnedBadges.map((badge) => (
            <span key={badge} className="cq-profile-badge">
              {badge}
            </span>
          ))}
        </div>
      </section>

      <section className="cq-profile-card" aria-label="Recent activity">
        <h3>Recent Activity</h3>
        <div className="cq-profile-activity-list">
          {mockProfile.recentActivity.map((activity, index) => (
            <article key={`${activity}-${index}`} className="cq-profile-activity-item">
              <p>{activity}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
