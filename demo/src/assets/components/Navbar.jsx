import Container from "./Container";

export default function Navbar() {
  return (
    <header className="navbar" id="top">
      <Container className="navbar-inner">
        <a className="logo" href="#top" aria-label="ClimbQuest home">
          ClimbQuest
        </a>

        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#preview">Preview</a>
          <a href="#studio">Studio</a>
          <a href="#cta">Pricing</a>
        </nav>

        <a className="nav-cta" href="#cta">
          Start Free
        </a>
      </Container>
    </header>
  );
}
