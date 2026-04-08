import { Navigate, Route, Routes } from "react-router-dom";
import MobileAppLayout from "./components/layout/MobileAppLayout";
import CommunityPage from "./pages/CommunityPage";
import CreatePage from "./pages/CreatePage";
import DiscoverPage from "./pages/DiscoverPage";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <Routes>
      {/* Landing page for first-time visitors */}
      <Route path="/" element={<LandingPage />} />

      {/* App layout with shared bottom tabs */}
      <Route element={<MobileAppLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Any unknown URL will redirect back to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
