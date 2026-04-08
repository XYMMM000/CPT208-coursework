import HeroSection from "./assets/sections/HeroSection";
import FeaturesSection from "./assets/sections/FeaturesSection";
import PreviewSection from "./assets/sections/PreviewSection";
import FooterSection from "./assets/sections/FooterSection";

export default function App() {
  return (
    <div className="app-shell">
      <HeroSection />
      <FeaturesSection />
      <PreviewSection />
      <FooterSection />
    </div>
  );
}