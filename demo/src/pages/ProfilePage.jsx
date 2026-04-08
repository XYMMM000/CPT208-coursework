import { useMemo } from "react";

const ONBOARDING_STORAGE_KEY = "climbquest_onboarding_preferences";
const CREATED_ROUTES_STORAGE_KEY = "climbquest_created_routes";
const ROUTE_INTERACTIONS_STORAGE_KEY = "climbquest_route_interactions";

const fallbackProfile = {
  username: "ClimbNova",
  weeklyClimbingCount: 3,
  completedChallenges: 2,
  earnedBadges: ["First Send", "Route Explorer"],
  savedRoutes: 1,
  recentActivity: [
    "Completed a community route",
    "Saved a route to Favorites",
    "Updated climbing preferences"
  ],
  growth: {
    monthlyGoalSessions: 16,
    currentSessions: 6,
    techniqueLevel: 56,
    enduranceLevel: 49,
    confidenceLevel: 61
  }
};

function safeParse(rawValue, fallback) {
  try {
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
}

function getProgressPercent(current, total) {
  if (!total) return 0;
  return Math.min(Math.round((current / total) * 100), 100);
}

function buildEarnedBadges({ createdRoutesCount, completedCount, savedCount }) {
  const badges = [];

  if (completedCount >= 1) badges.push("First Send");
  if (completedCount >= 5) badges.push("Challenge Crusher");
  if (savedCount >= 3) badges.push("Route Collector");
  if (createdRoutesCount >= 1) badges.push("Route Creator");
  if (createdRoutesCount >= 3) badges.push("Wall Architect");

  return badges;
}

function toDisplayName(level) {
  if (!level) return "Climber";
  return level;
}

export default function ProfilePage() {
  const profileData = useMemo(() => {
    const onboarding = safeParse(localStorage.getItem(ONBOARDING_STORAGE_KEY), {});
    const createdRoutes = safeParse(
      localStorage.getItem(CREATED_ROUTES_STORAGE_KEY),
      []
    );
    const routeInteractions = safeParse(
      localStorage.getItem(ROUTE_INTERACTIONS_STORAGE_KEY),
      {}
    );

    const interactionList = Object.values(routeInteractions);
    const completedCount = interactionList.filter(
      (item) => item && item.isCompleted
    ).length;
    const savedCount = interactionList.filter((item) => item && item.isSaved).length;
    const likedCount = interactionList.filter((item) => item && item.isLiked).length;
    const createdRoutesCount = createdRoutes.length;

    // Approximate weekly activity from local interactions to keep dashboard dynamic.
    const weeklyClimbingCount = Math.max(
      1,
      Math.min(7, completedCount + Math.ceil(likedCount / 2))
    );

    // Build recent activity feed from existing local data.
    const recentActivity = [];
    if (completedCount > 0) {
      recentActivity.push(`Completed ${completedCount} challenge(s) recently`);
    }
    if (savedCount > 0) {
      recentActivity.push(`Saved ${savedCount} route(s) to Favorites`);
    }
    if (createdRoutesCount > 0) {
      recentActivity.push(`Created ${createdRoutesCount} route(s)`);
      recentActivity.push(`Latest route: "${createdRoutes[0].routeName}"`);
    }
    if (onboarding.level || onboarding.style || onboarding.goal) {
      recentActivity.push("Updated personal climbing preferences");
    }

    const earnedBadges = buildEarnedBadges({
      createdRoutesCount,
      completedCount,
      savedCount
    });

    // If there is not enough real data yet, blend with fallback data for a friendly first experience.
    return {
      username: `${toDisplayName(onboarding.level)}Climber`,
      weeklyClimbingCount:
        weeklyClimbingCount || fallbackProfile.weeklyClimbingCount,
      completedChallenges: completedCount || fallbackProfile.completedChallenges,
      earnedBadges:
        earnedBadges.length > 0 ? earnedBadges : fallbackProfile.earnedBadges,
      savedRoutes: savedCount || fallbackProfile.savedRoutes,
      recentActivity:
        recentActivity.length > 0 ? recentActivity : fallbackProfile.recentActivity,
      growth: {
        monthlyGoalSessions: fallbackProfile.growth.monthlyGoalSessions,
        currentSessions: Math.min(
          fallbackProfile.growth.monthlyGoalSessions,
          weeklyClimbingCount * 2
        ),
        techniqueLevel: Math.min(100, 45 + createdRoutesCount * 8),
        enduranceLevel: Math.min(100, 40 + completedCount * 7),
        confidenceLevel: Math.min(100, 50 + savedCount * 6 + completedCount * 4)
      }
    };
  }, []);

  const monthlyProgress = useMemo(
    () =>
      getProgressPercent(
        profileData.growth.currentSessions,
        profileData.growth.monthlyGoalSessions
      ),
    [profileData.growth.currentSessions, profileData.growth.monthlyGoalSessions]
  );

  return (
    <section className="cq-profile-page">
      <header className="cq-profile-header">
        <p className="cq-page-eyebrow">Profile</p>
        <h2>{profileData.username}</h2>
        <p>Keep climbing, keep growing. You are building strong momentum this week.</p>
      </header>

      <section className="cq-profile-stats" aria-label="Profile stats">
        <article className="cq-profile-stat-card">
          <p>Weekly climbs</p>
          <h3>{profileData.weeklyClimbingCount}</h3>
        </article>
        <article className="cq-profile-stat-card">
          <p>Completed challenges</p>
          <h3>{profileData.completedChallenges}</h3>
        </article>
        <article className="cq-profile-stat-card">
          <p>Earned badges</p>
          <h3>{profileData.earnedBadges.length}</h3>
        </article>
        <article className="cq-profile-stat-card">
          <p>Saved routes</p>
          <h3>{profileData.savedRoutes}</h3>
        </article>
      </section>

      <section className="cq-profile-card" aria-label="Climbing growth">
        <h3>Climbing Growth</h3>

        <div className="cq-profile-progress-block">
          <div className="cq-profile-progress-head">
            <span>Monthly climbing goal</span>
            <span>
              {profileData.growth.currentSessions}/
              {profileData.growth.monthlyGoalSessions}
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
            <span>{profileData.growth.techniqueLevel}%</span>
          </div>
          <div className="cq-quest-progress-track">
            <div
              className="cq-quest-progress-fill"
              style={{ width: `${profileData.growth.techniqueLevel}%` }}
            />
          </div>
        </div>

        <div className="cq-profile-progress-block">
          <div className="cq-profile-progress-head">
            <span>Endurance</span>
            <span>{profileData.growth.enduranceLevel}%</span>
          </div>
          <div className="cq-quest-progress-track">
            <div
              className="cq-quest-progress-fill"
              style={{ width: `${profileData.growth.enduranceLevel}%` }}
            />
          </div>
        </div>

        <div className="cq-profile-progress-block">
          <div className="cq-profile-progress-head">
            <span>Confidence</span>
            <span>{profileData.growth.confidenceLevel}%</span>
          </div>
          <div className="cq-quest-progress-track">
            <div
              className="cq-quest-progress-fill"
              style={{ width: `${profileData.growth.confidenceLevel}%` }}
            />
          </div>
        </div>
      </section>

      <section className="cq-profile-card" aria-label="Earned badges">
        <h3>Earned Badges</h3>
        <div className="cq-profile-badge-row">
          {profileData.earnedBadges.map((badge) => (
            <span key={badge} className="cq-profile-badge">
              {badge}
            </span>
          ))}
        </div>
      </section>

      <section className="cq-profile-card" aria-label="Recent activity">
        <h3>Recent Activity</h3>
        <div className="cq-profile-activity-list">
          {profileData.recentActivity.map((activity, index) => (
            <article key={`${activity}-${index}`} className="cq-profile-activity-item">
              <p>{activity}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
