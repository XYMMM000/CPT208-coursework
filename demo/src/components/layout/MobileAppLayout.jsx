import { Outlet } from "react-router-dom";
import BottomTabNav from "../navigation/BottomTabNav";

export default function MobileAppLayout() {
  return (
    <div className="cq-app-shell">
      {/* Main content area for each route */}
      <main className="cq-app-main">
        <Outlet />
      </main>

      {/* Shared mobile-style bottom tabs */}
      <BottomTabNav />
    </div>
  );
}
