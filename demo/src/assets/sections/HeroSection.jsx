import Container from "../components/Container";
import PrimaryButton from "../components/PrimaryButton";

export default function HeroSection() {
  const handleStartClick = () => {
    alert("Welcome to ClimbQuest!");
  };

  return (
    <header className="hero-section">
      <Container className="hero-layout">
        <div className="hero-copy">
          <span className="hero-badge">Mobile-first climbing platform</span>
          <h1>ClimbQuest</h1>
          <p className="hero-subtitle">
            A playful climbing experience platform for route creation, challenge
            discovery, and community feedback
          </p>

          <div className="hero-actions">
            <PrimaryButton label="Start Your Climb" onClick={handleStartClick} />
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-phone">
            <div className="hero-phone-screen">
              <div className="mini-card">🔥 Daily Challenge</div>
              <div className="mini-card">🛠️ Create New Route</div>
              <div className="mini-card">⭐ Community Ratings</div>
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}