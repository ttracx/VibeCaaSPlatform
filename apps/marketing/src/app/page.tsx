import { HeroSection } from '@/components/HeroSection';
import { HighlightsSection } from '@/components/HighlightsSection';
import { ARSection } from '@/components/ARSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <HighlightsSection />
      <FeaturesSection />
      <ARSection />
      <CTASection />
      <Footer />
    </main>
  );
}