import { Link } from "react-router-dom";

const spotlightFeatures = [
  {
    id: "diy",
    icon: "D",
    title: "DIY Wall Route Builder",
    description:
      "Pick a real wall, zoom in, trace hold contours, then set start/finish and hand-foot points.",
    bullets: ["Select wall first", "Trace real holds", "Publish route in one flow"],
    status: "Builder mode ready",
    progressLabel: "Workflow readiness",
    progress: 92,
    to: "/create",
    cta: "Start DIY Route"
  },
  {
    id: "persona",
    icon: "P",
    title: "Climbing Persona + Customization",
    description:
      "Take the style quiz, unlock your climbing character, and receive personalized route picks.",
    bullets: ["More quiz questions", "Persona result + emoji", "Custom route recommendations"],
    status: "Quiz engine upgraded",
    progressLabel: "Personalization quality",
    progress: 88,
    to: "/discover",
    cta: "Take Persona Quiz"
  }
];

const secondaryFeatures = [
  {
    icon: "H",
    title: "Daily Home Quest",
    description: "Check today's challenge and session progress.",
    to: "/home"
  },
  {
    icon: "C",
    title: "Community Feed",
    description: "Explore routes from climbers and AI setters.",
    to: "/community"
  },
  {
    icon: "U",
    title: "Profile Growth",
    description: "Track badges, weekly climbs, and milestones.",
    to: "/profile"
  }
];

export default function LandingPage() {
  return (
    <div className="cq-landing-page">
      <section className="cq-hero-card cq-hero-card-with-bg">
        <div className="cq-hero-bg-overlay" aria-hidden="true" />
        <div className="cq-hero-glow cq-hero-glow-blue" aria-hidden="true" />
        <div className="cq-hero-glow cq-hero-glow-green" aria-hidden="true" />

        <p className="cq-eyebrow">Welcome to ClimbQuest</p>
        <h1>ClimbQuest</h1>

        <p className="cq-subtitle">
          ClimbQuest focuses on two core experiences: building your own DIY route on real walls,
          and discovering your personalized climbing persona.
        </p>

        <div className="cq-hero-cta-row">
          <Link className="cq-primary-btn" to="/create">
            Start DIY Route
          </Link>
          <Link className="cq-secondary-btn cq-hero-secondary-btn" to="/discover">
            Start Persona Quiz
          </Link>
        </div>

        <div className="cq-social-proof" aria-label="Social proof">
          <div className="cq-avatar-group" aria-hidden="true">
            <span>A</span>
            <span>L</span>
            <span>M</span>
          </div>
          <p>Trusted by beginner bouldering groups on campus</p>
        </div>
      </section>

      <section className="cq-landing-spotlight" aria-label="Main welcome features">
        {spotlightFeatures.map((feature) => (
          <article key={feature.id} className="cq-landing-spotlight-card">
            <div className="cq-feature-header">
              <span className="cq-feature-icon">{feature.icon}</span>
              <h3>{feature.title}</h3>
            </div>
            <div className="cq-landing-spotlight-meta">
              <span className="cq-landing-status-pill">{feature.status}</span>
              <span className="cq-landing-progress-value">{feature.progress}%</span>
            </div>
            <p>{feature.description}</p>
            <div className="cq-landing-progress-block" aria-label={feature.progressLabel}>
              <p>{feature.progressLabel}</p>
              <div className="cq-landing-progress-track">
                <div
                  className="cq-landing-progress-fill"
                  style={{ width: `${feature.progress}%` }}
                />
              </div>
            </div>
            <ul className="cq-welcome-step-list">
              {feature.bullets.map((item) => (
                <li key={`${feature.id}-${item}`}>{item}</li>
              ))}
            </ul>
            <Link className="cq-primary-btn cq-landing-spotlight-cta" to={feature.to}>
              {feature.cta}
            </Link>
          </article>
        ))}
      </section>

      <section className="cq-feature-grid cq-feature-grid-compact" aria-label="Other features">
        {secondaryFeatures.map((feature) => (
          <Link key={feature.title} className="cq-feature-link-card" to={feature.to}>
            <article className="cq-feature-card">
              <div className="cq-feature-header">
                <span className="cq-feature-icon">{feature.icon}</span>
                <h3>{feature.title}</h3>
              </div>
              <p>{feature.description}</p>
            </article>
          </Link>
        ))}
      </section>
    </div>
  );
}
