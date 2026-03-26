import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { TrustLogos } from "@/components/landing/TrustLogos";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { SocialProof } from "@/components/landing/SocialProof";
import { PricingPreview } from "@/components/landing/PricingPreview";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { FloatingCTA } from "@/components/landing/FloatingCTA";
import { usePageTitle } from "@/hooks/usePageTitle";

const Landing = () => {
  usePageTitle("Seu negócio local no topo do Google");

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      {/* Trust immediately after hero — reduces anxiety at first decision point */}
      <TrustLogos />
      {/* Problem agitation — creates urgency before showing solution */}
      <ProblemSection />
      {/* Solution framing — low cognitive load, 3 steps */}
      <HowItWorks />
      {/* Social proof right before features — validates before detail */}
      <SocialProof />
      {/* Features after social proof — reader is already primed */}
      <Features />
      {/* Pricing after features — value established before price reveal */}
      <PricingPreview />
      <FinalCTA />
      <Footer />
      {/* Sticky mobile CTA — always accessible conversion path */}
      <FloatingCTA />
    </div>
  );
};

export default Landing;
