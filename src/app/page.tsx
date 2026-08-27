import { Hero } from '@/components/landing/Hero';
import { LiveTicker } from '@/components/landing/LiveTicker';
import { LandingChartsRow } from '@/components/landing/LandingChartsRow';
import { HeroVideo } from '@/components/landing/HeroVideo';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { ResumeAiShowcase } from '@/components/landing/ResumeAiShowcase';
import { FeatureShowcase } from '@/components/landing/FeatureShowcase';
import { CtaBanner } from '@/components/landing/CtaBanner';

/** Landing page — first screen is hero + live ticker; resume AI and the rest follow. */
export default function Home() {
  return (
    <>
      <div className="flex min-h-dvh flex-col">
        <Hero />
        <LiveTicker />
      </div>
      <ResumeAiShowcase />
      <HeroVideo />
      <HowItWorks />
      <LandingChartsRow />
      <FeatureShowcase />
      <CtaBanner />
    </>
  );
}
