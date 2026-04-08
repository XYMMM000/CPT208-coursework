import HeroSection from "./sections/HeroSection";
import FeaturesSection from "./sections/FeaturesSection";
import PreviewSection from "./sections/PreviewSection";
import FooterSection from "./sections/FooterSection";

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