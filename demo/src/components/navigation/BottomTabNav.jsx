import { NavLink } from "react-router-dom";

const tabs = [
  { label: "Home", path: "/home", icon: "H" },
  { label: "Discover", path: "/discover", icon: "D" },
  { label: "Create", path: "/create", icon: "C" },
  { label: "Community", path: "/community", icon: "M" },
  { label: "Profile", path: "/profile", icon: "P" }
];

export default function BottomTabNav() {
  return (
    <nav className="cq-bottom-nav" aria-label="Bottom navigation">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            `cq-tab-item ${isActive ? "cq-tab-item-active" : ""}`
          }
        >
          <span className="cq-tab-icon" aria-hidden="true">
            {tab.icon}
          </span>
          <span className="cq-tab-label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
