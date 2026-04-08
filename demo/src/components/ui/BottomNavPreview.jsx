const navItems = [
  { icon: "H", label: "Home", isActive: true },
  { icon: "D", label: "Discover" },
  { icon: "C", label: "Create" },
  { icon: "M", label: "Community" },
  { icon: "P", label: "Profile" }
];

export default function BottomNavPreview() {
  return (
    <section className="cq-nav-mock" aria-label="Navigation preview">
      {navItems.map((item) => (
        <div
          key={item.label}
          className={`cq-nav-mock-item ${item.isActive ? "cq-nav-mock-item-active" : ""}`}
        >
          <span className="cq-nav-mock-icon" aria-hidden="true">
            {item.icon}
          </span>
          <span>{item.label}</span>
        </div>
      ))}
    </section>
  );
}
