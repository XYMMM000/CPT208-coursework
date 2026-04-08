const navItems = [
  { icon: "H", label: "Home" },
  { icon: "R", label: "Routes" },
  { icon: "C", label: "Create" },
  { icon: "P", label: "Profile" },
];

export default function BottomNavPreview() {
  return (
    <nav className="bottom-nav-preview" aria-label="App bottom navigation preview">
      {navItems.map((item) => (
        <button key={item.label} className="nav-preview-item" type="button">
          <span className="nav-preview-icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="nav-preview-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
