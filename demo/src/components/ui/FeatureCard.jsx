export default function FeatureCard({ icon, title, description }) {
  return (
    <article className="cq-feature-card">
      <div className="cq-feature-header">
        <span className="cq-feature-icon" aria-hidden="true">
          {icon}
        </span>
        <h3>{title}</h3>
      </div>

      <p>{description}</p>
    </article>
  );
}
