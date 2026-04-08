import { Link } from "react-router-dom";
import FeatureCard from "../components/ui/FeatureCard";

const landingFeatures = [
  {
    title: "Personalized Challenge",
    description:
      "Get climb recommendations based on your level, goals, and preferred climbing styles."
  },
  {
    title: "DIY Route Creation",
    description:
      "Build your own route ideas in a simple creator and share them with your climbing friends."
  },
  {
    title: "Community Rating",
    description:
      "Read feedback from other climbers, rate routes, and improve together as a community."
  }
];

export default function LandingPage() {
  return (
    <div className="cq-landing-page">
      <section className="cq-hero-card">
        <p className="cq-eyebrow">Human-Centered Climbing App</p>
        <h1>ClimbQuest</h1>
        <p className="cq-subtitle">
          A playful climbing experience platform for route creation, challenge
          discovery, and community feedback
        </p>

        {/* Main call-to-action button */}
        <Link className="cq-primary-btn" to="/home">
          Start Your Climb
        </Link>
      </section>

      <section className="cq-feature-grid" aria-label="Core features">
        {landingFeatures.map((feature) => (
          <FeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </section>

      {/* Simple mock preview of bottom navigation */}
      <section className="cq-nav-mock" aria-label="Navigation preview">
        <div className="cq-nav-mock-item cq-nav-mock-item-active">Home</div>
        <div className="cq-nav-mock-item">Discover</div>
        <div className="cq-nav-mock-item">Create</div>
        <div className="cq-nav-mock-item">Community</div>
        <div className="cq-nav-mock-item">Profile</div>
      </section>
    </div>
  );
}
