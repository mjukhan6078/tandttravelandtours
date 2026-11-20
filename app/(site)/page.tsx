import FaqSection from "@/components/site/FaqSection";
import HomeAbout, { ProcessSteps } from "@/components/site/HomeAbout";
import HomeHero from "@/components/site/HomeHero";
import HomeTestimonials from "@/components/site/HomeTestimonials";
import JourneyGrid from "@/components/site/JourneyGrid";
import PackageFlyers from "@/components/site/PackageFlyers";
import ServiceCards from "@/components/site/ServiceCards";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <JourneyGrid />
      <PackageFlyers />
      <ServiceCards />
      <HomeAbout />
      <ProcessSteps />
      <HomeTestimonials />
      <FaqSection limit={4} showViewAll />
    </>
  );
}
