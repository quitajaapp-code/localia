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
import { usePageTitle } from "@/hooks/usePageTitle";

const Landing = () => {
  usePageTitle("Seu negócio local no topo do Google");

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <TrustLogos />
      <ProblemSection />
      <HowItWorks />
      <Features />
      <SocialProof />
      <PricingPreview />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Landing;
