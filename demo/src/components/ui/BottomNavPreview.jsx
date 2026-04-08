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
      <div className="cq-preview-surface">
        <div className="cq-phone-content">
          <div className="cq-phone-widget">
            <p className="cq-phone-widget-label">Today&apos;s challenge</p>
            <p className="cq-phone-widget-title">Blue Slab Balance Route</p>
          </div>

          <div className="cq-phone-widget cq-phone-widget-soft">
            <p className="cq-phone-widget-label">Community mood</p>
            <p className="cq-phone-widget-title">92% found it fun</p>
          </div>
        </div>
      </div>

      <div className="cq-phone-nav cq-phone-nav-floating">
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
      </div>
    </section>
  );
}
