import AnimatedSection from "./AnimatedSection";

export default function About() {
  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">About Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your trusted partner in spiritual journeys
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "10+ Years Experience",
                desc: "Decades of expertise in organizing spiritual pilgrimages",
              },
              {
                title: "10,000+ Happy Pilgrims",
                desc: "Trusted by thousands of satisfied customers",
              },
              {
                title: "24/7 Support",
                desc: "Round-the-clock assistance for all your needs",
              },
            ].map((item, idx) => (
              <AnimatedSection key={idx} delay={idx * 0.15}>
                <div className="bg-card p-8 rounded-xl text-center hover:shadow-lg transition-shadow">
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
