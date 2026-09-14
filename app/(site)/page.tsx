import FaqSection from "@/components/site/FaqSection";
import HomeAbout from "@/components/site/HomeAbout";
import HomeHero, { ContactStrip } from "@/components/site/HomeHero";
import HomeTestimonials from "@/components/site/HomeTestimonials";
import JourneyGrid from "@/components/site/JourneyGrid";
import ServiceCards from "@/components/site/ServiceCards";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeAbout />
      <JourneyGrid />
      <ServiceCards />
      <HomeTestimonials />
      <FaqSection limit={3} showViewAll />
      <ContactStrip />
    </>
  );
}
