import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BottomNavPreview from "../components/ui/BottomNavPreview";

const welcomeTracks = [
  {
    id: "new",
    label: "New Climber",
    title: "Learn safely and enjoy your first sends",
    description:
      "Set your level, pick easy routes, and follow community beta with clear move tips.",
    steps: ["Open Home dashboard", "Check today’s recommended challenge", "Track your first completion"],
    ctaLabel: "Go to Home",
    ctaLink: "/home"
  },
  {
    id: "setter",
    label: "Route Setter",
    title: "Design and publish your own route line",
    description:
      "Pick a wall, zoom in, outline holds manually, then save and share your route with the community.",
    steps: ["Select a wall", "Outline hold contours", "Publish to community feed"],
    ctaLabel: "Build My Route",
    ctaLink: "/create"
  },
  {
    id: "social",
    label: "Social Climber",
    title: "Discover trending routes and exchange beta",
    description:
      "Search route feed, open route details, rate and comment, then save your favorites for next session.",
    steps: ["Open community feed", "Filter by style and level", "Rate and save useful routes"],
    ctaLabel: "Join Community",
    ctaLink: "/community"
  }
];

const quickLinks = [
  { label: "Create DIY Route", description: "Select a wall and draw your own line", to: "/create" },
  { label: "Discover Challenges", description: "Get personalized route recommendations", to: "/discover" },
  { label: "Community Beta", description: "See ratings, feedback, and route details", to: "/community" }
];

const landingFeatures = [
  {
    icon: "P",
    title: "Personalized Challenge",
    description:
      "Get route picks with level + style matching and a clear reason for each recommendation.",
    to: "/discover"
  },
  {
    icon: "D",
    title: "DIY Route Creation",
    description:
      "Choose a wall, zoom in, trace hold contours, and publish your own line in minutes.",
    to: "/create"
  },
  {
    icon: "C",
    title: "Community Rating",
    description:
      "Read beta tips, rate routes, and collect useful feedback from other climbers.",
    to: "/community"
  }
];

export default function LandingPage() {
  const [activeTrackId, setActiveTrackId] = useState("new");
  const activeTrack = useMemo(
    () => welcomeTracks.find((track) => track.id === activeTrackId) || welcomeTracks[0],
    [activeTrackId]
  );

  return (
    <div className="cq-landing-page">
      <section className="cq-hero-card">
        <div className="cq-hero-glow cq-hero-glow-blue" aria-hidden="true" />
        <div className="cq-hero-glow cq-hero-glow-green" aria-hidden="true" />

        <p className="cq-eyebrow">Welcome to ClimbQuest</p>
        <h1>ClimbQuest</h1>

        <p className="cq-subtitle">
          A playful climbing app for route building, challenge discovery, and social beta sharing.
          Pick your path below and we will guide you step by step.
        </p>

        <div className="cq-hero-cta-row">
          <Link className="cq-primary-btn" to="/home">
            Start Quest Session
          </Link>
          <a className="cq-secondary-btn cq-hero-secondary-btn" href="#how-it-works">
            How It Works
          </a>
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

      <section className="cq-welcome-tracks" id="how-it-works">
        <p className="cq-page-eyebrow">Choose Your Welcome Path</p>
        <div className="cq-welcome-track-tabs" role="tablist" aria-label="Welcome path tabs">
          {welcomeTracks.map((track) => (
            <button
              key={track.id}
              type="button"
              role="tab"
              className={`cq-welcome-track-tab ${
                activeTrackId === track.id ? "cq-welcome-track-tab-active" : ""
              }`}
              onClick={() => setActiveTrackId(track.id)}
              aria-selected={activeTrackId === track.id}
            >
              {track.label}
            </button>
          ))}
        </div>

        <article className="cq-welcome-track-panel" role="tabpanel">
          <h3>{activeTrack.title}</h3>
          <p>{activeTrack.description}</p>
          <ol className="cq-welcome-step-list">
            {activeTrack.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <Link className="cq-primary-btn cq-welcome-track-cta" to={activeTrack.ctaLink}>
            {activeTrack.ctaLabel}
          </Link>
        </article>
      </section>

      <section className="cq-welcome-quick-grid" aria-label="Quick start links">
        {quickLinks.map((item) => (
          <Link key={item.label} className="cq-welcome-quick-card" to={item.to}>
            <h3>{item.label}</h3>
            <p>{item.description}</p>
            <span className="cq-welcome-quick-arrow">Open</span>
          </Link>
        ))}
      </section>

      <section className="cq-feature-grid" aria-label="Core features">
        {landingFeatures.map((feature) => (
          <Link key={feature.title} className="cq-feature-link-card" to={feature.to}>
            <article className="cq-feature-card cq-feature-card-ink">
              <div className="cq-feature-header">
                <span className="cq-feature-icon">{feature.icon}</span>
                <h3>{feature.title}</h3>
              </div>
              <p>{feature.description}</p>
            </article>
          </Link>
        ))}
      </section>

      <BottomNavPreview />
    </div>
  );
}
