import { Navigate, Route, Routes } from "react-router-dom";
import MobileAppLayout from "./components/layout/MobileAppLayout";
import CommunityPage from "./pages/CommunityPage";
import CreatePage from "./pages/CreatePage";
import DiscoverPage from "./pages/DiscoverPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <Routes>
      {/* Shared app layout for all main pages */}
      <Route element={<MobileAppLayout />}>
        {/* Default route: open Home tab first */}
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Any unknown URL redirects to Home */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
