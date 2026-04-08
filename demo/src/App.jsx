import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MobileAppLayout from "./components/layout/MobileAppLayout";
import CommunityPage from "./pages/CommunityPage";
import CreatePage from "./pages/CreatePage";
import DiscoverPage from "./pages/DiscoverPage";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import ProfilePage from "./pages/ProfilePage";
import RouteDetailPage from "./pages/RouteDetailPage";
import SignupPage from "./pages/SignupPage";

export default function App() {
  return (
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
        <Route path="/create" element={<CreatePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/route-detail" element={<RouteDetailPage />} />
      </Route>

      {/* Any unknown URL redirects back to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
