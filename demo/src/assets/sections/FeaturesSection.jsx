import Container from "../components/Container";
import FeatureCard from "../components/FeatureCard";
import SectionTitle from "../components/SectionTitle";

const features = [
  {
    icon: "🎯",
    title: "Personalized Challenge",
    description:
      "Discover climbing challenges tailored to your level, preferences, and progress.",
  },
  {
    icon: "🛠️",
    title: "DIY Route Creation",
    description:
      "Build your own routes in a playful and accessible way, then share them with others.",
  },
  {
    icon: "⭐",
    title: "Community Rating",
    description:
      "Collect feedback from fellow climbers and improve every route with community insight.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="section">
      <Container>
        <SectionTitle
          eyebrow="Features"
          title="Built for climbers who love creating and exploring"
          description="ClimbQuest combines route building, challenge discovery, and social feedback in one simple mobile-first experience."
        />

        <div className="feature-grid">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}