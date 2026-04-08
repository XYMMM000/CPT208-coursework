export default function SectionTitle({ eyebrow, title, description }) {
  return (
    <header className="section-title">
      {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      {description ? <p className="section-description">{description}</p> : null}
    </header>
  );
}
