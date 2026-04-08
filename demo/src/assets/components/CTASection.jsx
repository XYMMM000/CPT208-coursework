import Container from "./Container";
import PrimaryButton from "./PrimaryButton";

export default function CTASection() {
  return (
    <section className="cta-section reveal-on-scroll" id="cta">
      <Container className="cta-inner">
        <p className="cta-tag">Ready To Launch</p>
        <h2>Ship better climbing experiences in days, not months</h2>
        <p>
          ClimbQuest helps gyms and creators launch route challenges, track community
          feedback, and keep climbers engaged with one simple platform.
        </p>

        <div className="cta-actions">
          <PrimaryButton label="Start Free Trial" />
          <a className="cta-link" href="#features">
            Explore Features
          </a>
        </div>
      </Container>
    </section>
  );
}
