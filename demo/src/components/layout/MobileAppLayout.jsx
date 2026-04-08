import { Outlet } from "react-router-dom";
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
        <button type="button" className="cq-secondary-btn cq-logout-btn" onClick={handleLogout}>
          Logout
        </button>
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
