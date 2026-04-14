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

const timelineSteps = [
  {
    id: "new",
    title: "New Climber Start",
    text: "Start with persona quiz, then open an easy DIY template wall.",
    ctaLabel: "Start with Quiz",
    ctaTo: "/discover"
  },
  {
    id: "builder",
    title: "Builder Session",
    text: "Go straight to DIY editor, trace holds, and assign start/finish points.",
    ctaLabel: "Open DIY Editor",
    ctaTo: "/create"
  },
  {
    id: "social",
    title: "Community Loop",
    text: "Publish route, get feedback, then improve with fresh persona suggestions.",
    ctaLabel: "View Community",
    ctaTo: "/community"
  }
];

const miniDemoHolds = [
  { id: "a", x: 14, y: 72 },
  { id: "b", x: 25, y: 60 },
  { id: "c", x: 38, y: 48 },
  { id: "d", x: 52, y: 40 },
  { id: "e", x: 66, y: 32 },
  { id: "f", x: 81, y: 22 }
];

export default function LandingPage() {
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [activeHotspotId, setActiveHotspotId] = useState(hotspots[0].id);
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [flippedCardId, setFlippedCardId] = useState("");
  const [routeAnimateKey, setRouteAnimateKey] = useState(0);
  const [miniPickedIds, setMiniPickedIds] = useState(["a", "c", "e"]);

  const activeHotspot = useMemo(
    () => hotspots.find((item) => item.id === activeHotspotId) || hotspots[0],
    [activeHotspotId]
  );

  const currentTimeline = timelineSteps[timelineIndex] || timelineSteps[0];

  const miniPath = useMemo(() => {
    const selected = miniDemoHolds.filter((hold) => miniPickedIds.includes(hold.id));
    return selected.map((hold) => `${hold.x},${hold.y}`).join(" ");
  }, [miniPickedIds]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRouteAnimateKey((prev) => prev + 1);
    }, 6000);
    return () => clearInterval(timer);
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

  function toggleMiniHold(holdId) {
    setMiniPickedIds((prev) => {
      if (prev.includes(holdId)) {
        return prev.filter((id) => id !== holdId);
      }
      return [...prev, holdId];
    });
  }

  return (
    <div
      className="cq-landing-bg cq-landing-interactive"
      onMouseMove={handleParallaxMove}
      onMouseLeave={handleParallaxLeave}
      style={{
        "--parallax-x": `${parallax.x}px`,
        "--parallax-y": `${parallax.y}px`
      }}
    >
      <div className="cq-landing-page">
        <section className="cq-hero-card cq-landing-hero-card">
          <div className="cq-hero-glow cq-hero-glow-blue" aria-hidden="true" />
          <div className="cq-hero-glow cq-hero-glow-green" aria-hidden="true" />

          <p className="cq-eyebrow">Welcome to ClimbQuest</p>
          <h1>ClimbQuest</h1>

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
            <button
              type="button"
              className="cq-secondary-btn cq-hero-secondary-btn"
              onClick={() => setRouteAnimateKey((prev) => prev + 1)}
            >
              Replay Route Intro
            </button>
          </div>

          <svg
            key={`hero-route-${routeAnimateKey}`}
            className="cq-hero-route-svg"
            viewBox="0 0 100 36"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polyline
              className="cq-hero-route-line"
              points="8,30 20,26 30,20 40,23 54,15 66,12 79,8 92,5"
            />
            <circle className="cq-hero-route-node" cx="8" cy="30" r="1.3" />
            <circle className="cq-hero-route-node" cx="40" cy="23" r="1.3" />
            <circle className="cq-hero-route-node" cx="92" cy="5" r="1.5" />
          </svg>

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

        <section className="cq-landing-timeline" aria-label="Quest timeline selector">
          <p className="cq-page-eyebrow">Quest Timeline</p>
          <h3>{currentTimeline.title}</h3>
          <p>{currentTimeline.text}</p>
          <input
            type="range"
            min="0"
            max={timelineSteps.length - 1}
            step="1"
            value={timelineIndex}
            onChange={(event) => setTimelineIndex(Number(event.target.value))}
            className="cq-timeline-slider"
            aria-label="Select timeline phase"
          />
          <div className="cq-timeline-labels" aria-hidden="true">
            {timelineSteps.map((step, index) => (
              <span key={step.id} className={index === timelineIndex ? "cq-timeline-label-active" : ""}>
                {step.id}
              </span>
            ))}
          </div>
          <Link className="cq-primary-btn cq-landing-timeline-cta" to={currentTimeline.ctaTo}>
            {currentTimeline.ctaLabel}
          </Link>
        </section>

        <section className="cq-landing-mini-demo" aria-label="Mini wall interaction demo">
          <div className="cq-feature-header">
            <span className="cq-feature-icon">M</span>
            <h3>Mini Wall Demo</h3>
          </div>
          <p>Tap holds to preview a route path. This simulates the DIY interaction flow.</p>

          <div className="cq-mini-wall">
            <svg className="cq-mini-wall-svg" viewBox="0 0 100 80" preserveAspectRatio="none">
              {miniPath && <polyline className="cq-mini-wall-path" points={miniPath} />}
              {miniDemoHolds.map((hold) => (
                <g key={hold.id}>
                  <circle
                    className={`cq-mini-wall-hold ${miniPickedIds.includes(hold.id) ? "cq-mini-wall-hold-active" : ""}`}
                    cx={hold.x}
                    cy={hold.y}
                    r="4.1"
                    onClick={() => toggleMiniHold(hold.id)}
                  />
                  <text x={hold.x} y={hold.y + 0.7} className="cq-mini-wall-label">
                    {hold.id.toUpperCase()}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="cq-mini-demo-actions">
            <button type="button" className="cq-secondary-btn" onClick={() => setMiniPickedIds(["a", "c", "e"])}>
              Reset Demo
            </button>
            <Link className="cq-primary-btn" to="/create">
              Open Full DIY Editor
            </Link>
          </div>
        </section>

        <section className="cq-landing-spotlight" aria-label="Main welcome features">
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
    </div>
  );
}
