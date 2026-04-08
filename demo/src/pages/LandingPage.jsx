import BottomNavPreview from "../components/ui/BottomNavPreview";
import FeatureCard from "../components/ui/FeatureCard";
import { Link } from "react-router-dom";

// Data is kept separate from JSX to make the component easier for beginners to edit.
const landingFeatures = [
  {
    icon: "P",
    tone: "primary",
    title: "Personalized Challenge",
    description:
      "Get smart route suggestions tuned to your level and daily climbing mood."
  },
  {
    icon: "D",
    tone: "mint",
    title: "DIY Route Creation",
    description:
      "Sketch and publish your own routes with a beginner-friendly creation flow."
  },
  {
    icon: "C",
    tone: "sun",
    title: "Community Rating",
    description:
      "See honest feedback, rate climbs, and learn from the local climbing community."
  }
];

export default function LandingPage() {
  return (
    <div className="cq-landing-page">
      {/* Hero section: first thing users see when they open the app */}
      <section className="cq-hero-card">
        <div className="cq-hero-glow cq-hero-glow-blue" aria-hidden="true" />
        <div className="cq-hero-glow cq-hero-glow-green" aria-hidden="true" />

        <p className="cq-eyebrow">Human-Centered Climbing App</p>
        <h1>ClimbQuest</h1>

        <p className="cq-subtitle">
          A playful platform for route creation, challenge discovery, and
          community feedback.
        </p>

        {/* Primary call-to-action */}
        <Link className="cq-primary-btn" to="/onboarding">
          Start Your Climb
        </Link>

        {/* Small social proof row to build trust quickly */}
        <div className="cq-social-proof" aria-label="Social proof">
          <div className="cq-avatar-group" aria-hidden="true">
            <span>A</span>
            <span>L</span>
            <span>M</span>
          </div>
          <p>Loved by student climbers in beginner clubs</p>
        </div>
      </section>

      {/* Feature cards highlight the 3 core app ideas */}
      <section className="cq-feature-grid" aria-label="Core features">
        {landingFeatures.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            tone={feature.tone}
            title={feature.title}
            description={feature.description}
            delay={index * 80}
          />
        ))}
      </section>

      {/* Phone-style preview helps users understand the mobile experience */}
      <BottomNavPreview />
    </div>
  );
}
