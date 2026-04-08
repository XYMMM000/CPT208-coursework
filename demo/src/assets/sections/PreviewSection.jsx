import Container from "../components/Container";
import SectionTitle from "../components/SectionTitle";
import BottomNavPreview from "../components/BottomNavPreview";

export default function PreviewSection() {
  return (
    <section className="section section-muted">
      <Container>
        <SectionTitle
          eyebrow="Preview"
          title="Simple navigation for a friendly climbing experience"
          description="This mock mobile preview shows how users can quickly move through the main areas of the app."
        />

        <div className="preview-wrapper">
          <div className="preview-phone">
            <div className="preview-screen">
              <div className="preview-header">
                <span className="preview-pill">Today</span>
                <h3>Your Next Climb</h3>
              </div>

              <div className="preview-content">
                <div className="preview-panel">🧗 Beginner route nearby</div>
                <div className="preview-panel">🔥 Weekly challenge unlocked</div>
                <div className="preview-panel">💬 12 new community reviews</div>
              </div>
            </div>

            <BottomNavPreview />
          </div>
        </div>
      </Container>
    </section>
  );
}