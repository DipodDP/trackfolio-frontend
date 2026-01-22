"use client";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
}

export function HeroSection({
  title = "Mission Control",
  subtitle = "Your portfolio's command center. Monitor performance, track assets, and launch your next financial maneuver.",
}: HeroSectionProps) {
  return (
    <section className="relative mb-16 text-center md:text-left py-8 md:py-12">
      <div className="skewed-bg" />
      <div className="relative">
        <h1 className="font-display text-display-lg md:text-display-xl tracking-wider text-primary uppercase leading-none">
          {title}
        </h1>
        <p className="mt-4 text-lg text-secondary max-w-2xl mx-auto md:mx-0">
          {subtitle}
        </p>
      </div>
    </section>
  );
}

export default HeroSection;
