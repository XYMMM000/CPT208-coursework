import Container from "../components/Container";
import SectionTitle from "../components/SectionTitle";
import BottomNavPreview from "../components/BottomNavPreview";

export default function PreviewSection() {
  return (
    <section className="section section-muted reveal-on-scroll" id="preview">
      <Container>
        <SectionTitle
          eyebrow="Product Preview"
          title="Built for mobile behavior and rapid in-gym decisions"
          description="Climbers can discover routes, join challenges, and submit feedback in just a few taps."
        />

        <div className="preview-wrapper">
          <div className="preview-phone">
            <div className="preview-screen">
              <div className="preview-header">
                <span className="preview-pill">Today</span>
                <h3>Dashboard Snapshot</h3>
              </div>

              <div className="preview-content">
                <div className="preview-panel">Beginner route nearby</div>
                <div className="preview-panel">Weekly challenge unlocked</div>
                <div className="preview-panel">12 new community reviews</div>
              </div>
            </div>

            <BottomNavPreview />
          </div>
        </div>
      </Container>
    </section>
  );
}
