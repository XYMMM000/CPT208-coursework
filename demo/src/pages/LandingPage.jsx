import { useEffect, useMemo, useState } from "react";
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
    cta: "Start DIY Route",
    backTitle: "Why it feels powerful",
    backText: "You can interact directly on the wall: contour holds, assign route points, and preview instantly.",
    backAction: "Open Editor"
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
    cta: "Take Persona Quiz",
    backTitle: "Why it feels personal",
    backText: "Answer a few behavioral questions and get a route profile, mascot, and challenge path matched to you.",
    backAction: "Run Quiz"
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

const hotspots = [
  {
    id: "hs-diy",
    label: "DIY",
    summary: "Jump into wall editor and draw your route on real holds.",
    to: "/create",
    x: 14,
    y: 70
  },
  {
    id: "hs-quiz",
    label: "Quiz",
    summary: "Discover your climbing persona and personalized challenges.",
    to: "/discover",
    x: 46,
    y: 52
  },
  {
    id: "hs-community",
    label: "Beta",
    summary: "Open community routes and view route path overlays.",
    to: "/community",
    x: 80,
    y: 36
  }
];

export default function LandingPage() {
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [activeHotspotId, setActiveHotspotId] = useState(hotspots[0].id);
  const [flippedCardId, setFlippedCardId] = useState("");
  const [visibleSections, setVisibleSections] = useState({});

  const activeHotspot = useMemo(
    () => hotspots.find((item) => item.id === activeHotspotId) || hotspots[0],
    [activeHotspotId]
  );

  useEffect(() => {
    const targets = document.querySelectorAll("[data-reveal-id]");
    if (targets.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const revealId = entry.target.getAttribute("data-reveal-id");
          if (!revealId) return;
          setVisibleSections((prev) => ({ ...prev, [revealId]: true }));
        });
      },
      { threshold: 0.25 }
    );

    targets.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  function handleParallaxMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;

    setParallax({
      x: Number((offsetX * 14).toFixed(2)),
      y: Number((offsetY * 14).toFixed(2))
    });
  }

  function handleParallaxLeave() {
    setParallax({ x: 0, y: 0 });
  }

  function toggleCardFlip(cardId) {
    setFlippedCardId((prev) => (prev === cardId ? "" : cardId));
  }

  return (
    <div
      className="cq-landing-bg cq-landing-interactive cq-landing-scroll"
      onMouseMove={handleParallaxMove}
      onMouseLeave={handleParallaxLeave}
      style={{
        "--parallax-x": `${parallax.x}px`,
        "--parallax-y": `${parallax.y}px`
      }}
    >
      <div className="cq-landing-page cq-landing-page-scroll">
        <section className="cq-welcome-cover cq-scroll-stage">
          <p className="cq-eyebrow">Human-Centered Climbing App</p>
          <h1>ClimbQuest</h1>
          <p>Scroll down to explore features</p>
        </section>

        <section
          className={`cq-hero-card cq-landing-hero-card cq-scroll-stage cq-scroll-reveal ${
            visibleSections.hero ? "is-visible" : ""
          }`}
          data-reveal-id="hero"
        >
          <div className="cq-hero-glow cq-hero-glow-blue" aria-hidden="true" />
          <div className="cq-hero-glow cq-hero-glow-green" aria-hidden="true" />

          <p className="cq-eyebrow">Welcome to ClimbQuest</p>
          <h2>Interactive Climbing Experience</h2>

          <p className="cq-subtitle">
            A climbing app with strong interaction focus: draw routes on real wall photos and
            unlock personalized climbing persona guidance.
          </p>

          <div className="cq-hero-cta-row">
            <Link className="cq-primary-btn" to="/create">
              Start DIY Route
            </Link>
            <Link className="cq-secondary-btn cq-hero-secondary-btn" to="/discover">
              Start Persona Quiz
            </Link>
          </div>

          <div className="cq-hotspot-layer" aria-label="Interactive feature hotspots">
            {hotspots.map((hotspot) => (
              <button
                key={hotspot.id}
                type="button"
                className={`cq-hotspot-btn ${activeHotspotId === hotspot.id ? "cq-hotspot-btn-active" : ""}`}
                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                onClick={() => setActiveHotspotId(hotspot.id)}
              >
                {hotspot.label}
              </button>
            ))}
          </div>

          <div className="cq-hotspot-panel">
            <p>{activeHotspot.summary}</p>
            <Link className="cq-secondary-btn" to={activeHotspot.to}>
              Open {activeHotspot.label}
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

        <section
          className={`cq-landing-spotlight cq-scroll-stage cq-scroll-reveal ${
            visibleSections.spotlight ? "is-visible" : ""
          }`}
          aria-label="Main welcome features"
          data-reveal-id="spotlight"
        >
          {spotlightFeatures.map((feature) => {
            const flipped = flippedCardId === feature.id;
            return (
              <article
                key={feature.id}
                className={`cq-landing-spotlight-card cq-flip-card ${flipped ? "cq-flip-card-active" : ""}`}
              >
                <div className="cq-flip-card-inner">
                  <div className="cq-flip-face cq-flip-face-front">
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
                        <div className="cq-landing-progress-fill" style={{ width: `${feature.progress}%` }} />
                      </div>
                    </div>
                    <ul className="cq-welcome-step-list">
                      {feature.bullets.map((item) => (
                        <li key={`${feature.id}-${item}`}>{item}</li>
                      ))}
                    </ul>
                    <div className="cq-flip-card-actions">
                      <Link className="cq-primary-btn cq-landing-spotlight-cta" to={feature.to}>
                        {feature.cta}
                      </Link>
                      <button type="button" className="cq-secondary-btn" onClick={() => toggleCardFlip(feature.id)}>
                        More
                      </button>
                    </div>
                  </div>

                  <div className="cq-flip-face cq-flip-face-back">
                    <p className="cq-page-eyebrow">Deep View</p>
                    <h3>{feature.backTitle}</h3>
                    <p>{feature.backText}</p>
                    <div className="cq-flip-card-actions">
                      <Link className="cq-primary-btn cq-landing-spotlight-cta" to={feature.to}>
                        {feature.backAction}
                      </Link>
                      <button type="button" className="cq-secondary-btn" onClick={() => toggleCardFlip(feature.id)}>
                        Back
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section
          className={`cq-feature-grid cq-feature-grid-compact cq-scroll-stage cq-scroll-reveal ${
            visibleSections.secondary ? "is-visible" : ""
          }`}
          aria-label="Other features"
          data-reveal-id="secondary"
        >
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
    </div>
  );
}
