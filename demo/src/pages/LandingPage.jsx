import BottomNavPreview from "../components/ui/BottomNavPreview";
import FeatureCard from "../components/ui/FeatureCard";
import { Link } from "react-router-dom";

// Data is kept separate from JSX to make the component easier for beginners to edit.
const landingFeatures = [
  {
    icon: "P",
    title: "Personalized Challenge",
    description:
      "Get challenge ideas based on your climbing level, goals, and preferred style."
  },
  {
    icon: "D",
    title: "DIY Route Creation",
    description:
      "Design your own routes with simple tools and share them with your climbing group."
  },
  {
    icon: "C",
    title: "Community Rating",
    description:
      "Read feedback from other climbers and rate routes to help everyone improve."
  }
];

export default function LandingPage() {
  return (
    <div className="cq-landing-page">
      {/* Hero section: first thing users see when they open the app */}
      <section className="cq-hero-card">
        <p className="cq-eyebrow">Human-Centered Climbing App</p>
        <h1>ClimbQuest</h1>

        <p className="cq-subtitle">
          A playful climbing experience platform for route creation, challenge
          discovery, and community feedback
        </p>

        {/* Primary call-to-action */}
        <Link className="cq-primary-btn" to="/onboarding">
          Start Your Climb
        </Link>
      </section>

      {/* Feature cards highlight the 3 core app ideas */}
      <section className="cq-feature-grid" aria-label="Core features">
        {landingFeatures.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </section>

      {/* Simple visual preview of the future app bottom navigation */}
      <BottomNavPreview />
    </div>
  );
}
