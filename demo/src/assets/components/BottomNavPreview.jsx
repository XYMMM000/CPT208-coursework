const navItems = ["Home", "Routes", "Create", "Profile"];

export default function BottomNavPreview() {
  return (
    <nav className="bottom-nav-preview" aria-label="App bottom navigation preview">
      {navItems.map((item) => (
        <span key={item} className="bottom-nav-item">
          {item}
        </span>
      ))}
    </nav>
  );
}
