import Navbar from "./assets/components/Navbar";
import CTASection from "./assets/components/CTASection";
import HeroSection from "./assets/sections/HeroSection";
import FeaturesSection from "./assets/sections/FeaturesSection";
import PreviewSection from "./assets/sections/PreviewSection";
import ProductStudioSection from "./assets/sections/ProductStudioSection";
import FooterSection from "./assets/sections/FooterSection";

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PreviewSection />
        <ProductStudioSection />
        <CTASection />
      </main>
      <FooterSection />
    </div>
  );
}
