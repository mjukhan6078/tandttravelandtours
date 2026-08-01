import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import PlanYourTrip from "@/components/PlanYourTrip";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50">
        <TopBar />
        <Header />
      </div>
      <Hero />
      <About />
      <Services />
      <Testimonials />
      <FAQ />
      <PlanYourTrip />
      <Contact />
      <Footer />
    </main>
  );
}
