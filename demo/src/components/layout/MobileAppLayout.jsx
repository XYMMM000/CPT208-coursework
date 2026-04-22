import { Link, Outlet, useLocation } from "react-router-dom";
import BottomTabNav from "../navigation/BottomTabNav";
import { useAuth } from "../../context/AuthContext";
import { EXPERIENCE_MODES, useExperienceMode } from "../../context/ExperienceModeContext";

export default function MobileAppLayout() {
  const { currentUser, logoutUser } = useAuth();
  const { mode, setMode } = useExperienceMode();
  const location = useLocation();
  const isCreateEditorPage = location.pathname.startsWith("/create/editor/");

  async function handleLogout() {
    await logoutUser();
  }

  return (
    <div
      className={`cq-app-shell ${isCreateEditorPage ? "cq-app-shell-wide" : ""} cq-mode-${mode}`}
    >
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

      <section className="cq-experience-switcher" aria-label="UI experience mode">
        <button
          type="button"
          className={`cq-mode-chip ${mode === EXPERIENCE_MODES.LITE ? "cq-mode-chip-active" : ""}`}
          onClick={() => setMode(EXPERIENCE_MODES.LITE)}
        >
          Lite
        </button>
        <button
          type="button"
          className={`cq-mode-chip ${mode === EXPERIENCE_MODES.GUIDED ? "cq-mode-chip-active" : ""}`}
          onClick={() => setMode(EXPERIENCE_MODES.GUIDED)}
        >
          Guided
        </button>
        <button
          type="button"
          className={`cq-mode-chip ${mode === EXPERIENCE_MODES.IMPACT ? "cq-mode-chip-active" : ""}`}
          onClick={() => setMode(EXPERIENCE_MODES.IMPACT)}
        >
          Impact
        </button>
      </section>

      {/* Main content area for each route */}
      <main className="cq-app-main">
        <Outlet />
      </main>

      {/* Shared mobile-style bottom tabs */}
      <BottomTabNav />
    </div>
  );
}
