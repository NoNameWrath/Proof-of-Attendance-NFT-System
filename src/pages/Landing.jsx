import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import StatsSection from '../components/landing/StatsSection';
import LandingFooter from '../components/landing/LandingFooter';

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white">
      <LandingNavbar />
      <HeroSection />
      <HowItWorksSection />
      <StatsSection />
      <LandingFooter />
    </div>
  );
}
