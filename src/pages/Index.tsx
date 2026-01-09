import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedGames } from "@/components/home/FeaturedGames";
import { GameCategories } from "@/components/home/GameCategories";
import { PromoBannerGrid, PromoBanner } from "@/components/home/PromoBanner";
import { AllGameCategories } from "@/components/home/GamesList";
import { GameProviders } from "@/components/home/GameProviders";
import { ComingSoon } from "@/components/home/ComingSoon";
import { Testimonials } from "@/components/home/Testimonials";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <HeroSection />
        <FeaturedGames />
        <PromoBannerGrid />
        <GameCategories />
        <AllGameCategories />
        <div className="container mx-auto px-4 py-8">
          <PromoBanner variant="tournament" />
        </div>
        <GameProviders />
        <ComingSoon />
        <Testimonials />
        <div className="container mx-auto px-4 py-8">
          <PromoBanner variant="cashback" />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
