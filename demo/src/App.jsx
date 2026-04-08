import { Navigate, Route, Routes } from "react-router-dom";
import MobileAppLayout from "./components/layout/MobileAppLayout";
import CommunityPage from "./pages/CommunityPage";
import CreatePage from "./pages/CreatePage";
import DiscoverPage from "./pages/DiscoverPage";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <Routes>
      {/* Public pages without bottom tab navigation */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Shared app layout for 5 main tab pages */}
      <Route element={<MobileAppLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Any unknown URL redirects back to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
