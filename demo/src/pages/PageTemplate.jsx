export default function PageTemplate({ title, description }) {
  return (
    <section className="cq-page-card">
      <p className="cq-page-eyebrow">ClimbQuest</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}
