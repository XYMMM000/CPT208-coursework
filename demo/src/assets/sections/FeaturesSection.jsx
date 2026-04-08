import Container from "../components/Container";
import FeatureCard from "../components/FeatureCard";
import SectionTitle from "../components/SectionTitle";

const features = [
  {
    icon: "01",
    title: "Challenge Automation",
    description:
      "Configure weekly challenge templates and launch them automatically for different skill levels.",
  },
  {
    icon: "02",
    title: "Route Builder Toolkit",
    description:
      "Design and publish routes in minutes with reusable templates, tags, and difficulty presets.",
  },
  {
    icon: "03",
    title: "Community Feedback Loop",
    description:
      "Collect ratings and comments, then use insights dashboards to improve routes faster.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="section reveal-on-scroll" id="features">
      <Container>
        <SectionTitle
          eyebrow="Features"
          title="Everything teams need to run a modern climbing product"
          description="ClimbQuest unifies route operations, challenge engagement, and community insights in one platform."
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
