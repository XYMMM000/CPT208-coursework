import { useEffect, useRef, useState } from "react";
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
    coverImage: "/DIY%E9%A1%B5%E9%9D%A2.jpeg",
    cta: "Start DIY Route",
    backTitle: "Precision Route Design",
    backText: "Shape movement flow, lock in start and finish, and build a line that feels competition-ready.",
    backAction: "Enter Setter Mode"
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
    coverImage: "/%E9%97%AE%E5%8D%B7%E5%8D%A1%E9%9D%A2.jpeg",
    cta: "Take Persona Quiz",
    backTitle: "Competition Mindset Scan",
    backText: "Reveal your pressure style, decision rhythm, and route profile for stronger challenge performance.",
    backAction: "Start Mindset Quiz"
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
  const scrollContainerRef = useRef(null);
  const heroSectionRef = useRef(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [pointerGlow, setPointerGlow] = useState({ x: 50, y: 36 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [flippedCardId, setFlippedCardId] = useState("");
  const [visibleSections, setVisibleSections] = useState({});

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

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return undefined;

    function syncScrollProgress() {
      const maxScrollable = container.scrollHeight - container.clientHeight;
      if (maxScrollable <= 0) {
        setScrollProgress(0);
        return;
      }
      const progress = (container.scrollTop / maxScrollable) * 100;
      setScrollProgress(Math.max(0, Math.min(100, progress)));
    }

    syncScrollProgress();
    container.addEventListener("scroll", syncScrollProgress, { passive: true });
    window.addEventListener("resize", syncScrollProgress);

    return () => {
      container.removeEventListener("scroll", syncScrollProgress);
      window.removeEventListener("resize", syncScrollProgress);
    };
  }, []);

  function handleParallaxMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;

    setParallax({
      x: Number((offsetX * 14).toFixed(2)),
      y: Number((offsetY * 14).toFixed(2))
    });

    setPointerGlow({
      x: Number((((event.clientX - rect.left) / rect.width) * 100).toFixed(2)),
      y: Number((((event.clientY - rect.top) / rect.height) * 100).toFixed(2))
    });
  }

  function handleParallaxLeave() {
    setParallax({ x: 0, y: 0 });
    setPointerGlow({ x: 50, y: 36 });
  }

  function toggleCardFlip(cardId) {
    setFlippedCardId((prev) => (prev === cardId ? "" : cardId));
  }

  function handleEnterExperience() {
    const container = scrollContainerRef.current;
    const target = heroSectionRef.current;
    if (!container || !target) return;

    const targetOffset = target.offsetTop - 12;
    container.scrollTo({ top: targetOffset, behavior: "smooth" });
  }

  return (
    <div
      ref={scrollContainerRef}
      className="cq-landing-bg cq-landing-interactive cq-landing-scroll"
      onMouseMove={handleParallaxMove}
      onMouseLeave={handleParallaxLeave}
      style={{
        "--parallax-x": `${parallax.x}px`,
        "--parallax-y": `${parallax.y}px`,
        "--pointer-x": `${pointerGlow.x}%`,
        "--pointer-y": `${pointerGlow.y}%`,
        "--scroll-progress": `${scrollProgress}%`
      }}
    >
      <div className="cq-landing-progress-rail" aria-hidden="true">
        <span className="cq-landing-scroll-progress-fill" />
      </div>

      <div className="cq-landing-page cq-landing-page-scroll">
        <section className="cq-welcome-cover cq-scroll-stage">
          <div className="cq-welcome-atmosphere" aria-hidden="true">
            <span className="cq-welcome-node cq-welcome-node-a" />
            <span className="cq-welcome-node cq-welcome-node-b" />
            <span className="cq-welcome-node cq-welcome-node-c" />
          </div>
          <div className="cq-welcome-cover-core">
            <p className="cq-eyebrow cq-welcome-eyebrow">Human-Centered Climbing App</p>
            <h1 className="cq-welcome-title">
              <span className="cq-welcome-title-front">Climb</span>
              <span className="cq-welcome-title-accent">Quest</span>
            </h1>
            <p className="cq-welcome-tagline">Tap into route design and persona strategy.</p>
            <button className="cq-primary-btn cq-enter-btn" type="button" onClick={handleEnterExperience}>
              Enter Experience
            </button>
          </div>
          <div className="cq-scroll-hint" aria-hidden="true">
            <span>Scroll to enter</span>
            <span className="cq-scroll-hint-arrow" />
          </div>
        </section>

        <div className="cq-landing-main-stack">
          <section
            ref={heroSectionRef}
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
                  role="button"
                  tabIndex={0}
                  aria-label={`Flip ${feature.title} card`}
                  onClick={() => toggleCardFlip(feature.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      toggleCardFlip(feature.id);
                    }
                  }}
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
                        <Link
                          className="cq-primary-btn cq-landing-spotlight-cta"
                          to={feature.to}
                          onClick={(event) => event.stopPropagation()}
                        >
                          {feature.cta}
                        </Link>
                      </div>
                    </div>

                    <div className="cq-flip-face cq-flip-face-back">
                      <div className="cq-flip-back-media">
                        <img src={feature.coverImage} alt={`${feature.title} back cover`} />
                        <div className="cq-flip-back-overlay" />
                      </div>
                      <div className="cq-flip-back-content">
                        <h3>{feature.backTitle}</h3>
                        <p>{feature.backText}</p>
                        <div className="cq-flip-card-actions">
                          <Link
                            className="cq-primary-btn cq-landing-spotlight-cta"
                            to={feature.to}
                            onClick={(event) => event.stopPropagation()}
                          >
                            {feature.backAction}
                          </Link>
                        </div>
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
    </div>
  );
}
