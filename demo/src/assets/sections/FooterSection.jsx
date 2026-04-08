import Container from "../components/Container";

export default function FooterSection() {
  return (
    <footer className="footer">
      <Container className="footer-inner">
        <p>(c) 2026 ClimbQuest Inc. All rights reserved.</p>
        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#preview">Preview</a>
          <a href="#cta">Get Started</a>
        </div>
      </Container>
    </footer>
  );
}
