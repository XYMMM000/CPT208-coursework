export default function FeatureCard({
  icon,
  title,
  description,
  tone = "primary",
  delay = 0
}) {
  return (
    <article
      className={`cq-feature-card cq-feature-card-${tone}`}
      style={{ animationDelay: `${delay}ms` }}
    >
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
