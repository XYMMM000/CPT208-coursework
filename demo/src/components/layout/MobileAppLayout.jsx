import { Link, Outlet } from "react-router-dom";
import BottomTabNav from "../navigation/BottomTabNav";
import { useAuth } from "../../context/AuthContext";

export default function MobileAppLayout() {
  const { currentUser, logoutUser } = useAuth();

  async function handleLogout() {
    await logoutUser();
  }

  return (
    <div className="cq-app-shell">
      {/* Simple top bar with current account and logout action */}
      <header className="cq-app-topbar">
        <p className="cq-app-user">{currentUser?.email || "Signed in user"}</p>
        <div className="cq-topbar-actions">
          <Link to="/" className="cq-secondary-btn cq-topbar-btn">
            Welcome
          </Link>
          <button
            type="button"
            className="cq-secondary-btn cq-logout-btn cq-topbar-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content area for each route */}
      <main className="cq-app-main">
        <Outlet />
      </main>

      {/* Shared mobile-style bottom tabs */}
      <BottomTabNav />
    </div>
  );
}
