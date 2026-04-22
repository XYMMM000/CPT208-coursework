import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MobileAppLayout from "./components/layout/MobileAppLayout";
import CommunityPage from "./pages/CommunityPage";
import CreatePage from "./pages/CreatePage";
import CreateWallSelectionPage from "./pages/CreateWallSelectionPage";
import DiscoverPage from "./pages/DiscoverPage";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import ProfilePage from "./pages/ProfilePage";
import RouteDetailPage from "./pages/RouteDetailPage";
import SignupPage from "./pages/SignupPage";

export default function App() {
  const location = useLocation();
  const [ambientPointer, setAmbientPointer] = useState({ x: 50, y: 32 });
  const [globalScrollProgress, setGlobalScrollProgress] = useState(0);

  const isLandingRoute = location.pathname === "/";
  const isCreateEditorRoute = location.pathname.startsWith("/create/editor/");
  const disableGlobalAmbientFx = isLandingRoute || isCreateEditorRoute;

  useEffect(() => {
    if (disableGlobalAmbientFx) {
      setGlobalScrollProgress(0);
      return undefined;
    }

    function syncGlobalScrollProgress() {
      const root = document.documentElement;
      const maxScrollable = root.scrollHeight - window.innerHeight;
      if (maxScrollable <= 0) {
        setGlobalScrollProgress(0);
        return;
      }
      const progress = (window.scrollY / maxScrollable) * 100;
      setGlobalScrollProgress(Math.max(0, Math.min(100, progress)));
    }

    syncGlobalScrollProgress();
    window.addEventListener("scroll", syncGlobalScrollProgress, { passive: true });
    window.addEventListener("resize", syncGlobalScrollProgress);
    return () => {
      window.removeEventListener("scroll", syncGlobalScrollProgress);
      window.removeEventListener("resize", syncGlobalScrollProgress);
    };
  }, [location.pathname, disableGlobalAmbientFx]);

  function handleAmbientPointerMove(event) {
    setAmbientPointer({
      x: Number(((event.clientX / window.innerWidth) * 100).toFixed(2)),
      y: Number(((event.clientY / window.innerHeight) * 100).toFixed(2))
    });
  }

  function handleAmbientPointerLeave() {
    setAmbientPointer({ x: 50, y: 32 });
  }

  function handleAmbientTouchMove(event) {
    const touch = event.touches?.[0];
    if (!touch) return;
    setAmbientPointer({
      x: Number(((touch.clientX / window.innerWidth) * 100).toFixed(2)),
      y: Number(((touch.clientY / window.innerHeight) * 100).toFixed(2))
    });
  }

  return (
    <div
      className={`cq-global-interaction-shell ${isLandingRoute ? "cq-global-interaction-shell-landing" : ""} ${
        isCreateEditorRoute ? "cq-global-interaction-shell-editor" : ""
      }`}
      onMouseMove={disableGlobalAmbientFx ? undefined : handleAmbientPointerMove}
      onMouseLeave={disableGlobalAmbientFx ? undefined : handleAmbientPointerLeave}
      onTouchMove={disableGlobalAmbientFx ? undefined : handleAmbientTouchMove}
      style={{
        "--cq-global-pointer-x": `${ambientPointer.x}%`,
        "--cq-global-pointer-y": `${ambientPointer.y}%`,
        "--cq-global-scroll-progress": `${globalScrollProgress}%`
      }}
    >
      <div className="cq-global-progress-rail" aria-hidden="true">
        <span className="cq-global-progress-fill" />
      </div>

      <Routes>
        {/* Public pages without bottom tab navigation */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Protected pages: user must be logged in */}
        <Route
          element={
            <ProtectedRoute>
              <MobileAppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<HomePage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/create" element={<CreateWallSelectionPage />} />
          <Route path="/create/editor/:wallId" element={<CreatePage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/route-detail" element={<RouteDetailPage />} />
        </Route>

        {/* Any unknown URL redirects back to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
