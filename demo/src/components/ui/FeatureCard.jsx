export default function FeatureCard({ title, description }) {
  return (
    <article className="cq-feature-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}
