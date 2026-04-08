import Container from "../components/Container";
import PrimaryButton from "../components/PrimaryButton";

export default function HeroSection() {
  const scrollToCta = () => {
    const cta = document.getElementById("cta");
    if (cta) cta.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="hero-section">
      <Container className="hero-layout">
        <div className="hero-copy reveal-on-scroll">
          <span className="hero-badge">Product Platform For Climbing Communities</span>
          <h1>ClimbQuest</h1>
          <p className="hero-subtitle">
            Launch route challenges, grow retention, and turn every climbing session
            into a rewarding product experience.
          </p>

          <div className="hero-actions">
            <PrimaryButton label="Get Started" onClick={scrollToCta} />
            <a className="secondary-link" href="#preview">
              See Product Preview
            </a>
          </div>

          <dl className="hero-stats">
            <div>
              <dt>120+</dt>
              <dd>Active gyms</dd>
            </div>
            <div>
              <dt>42K</dt>
              <dd>Monthly climbs</dd>
            </div>
            <div>
              <dt>4.9/5</dt>
              <dd>User rating</dd>
            </div>
          </dl>
        </div>

        <div className="hero-visual reveal-on-scroll" aria-hidden="true">
          <div className="hero-phone">
            <div className="hero-phone-screen">
              <div className="mini-card">Daily Challenge Live</div>
              <div className="mini-card">Create New Route</div>
              <div className="mini-card">Community Rating Updated</div>
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}
