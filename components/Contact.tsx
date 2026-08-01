import AnimatedSection from "./AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WHATSAPP_NUMBER = "923002062324";
const WHATSAPP_DISPLAY = "+92 300 2062324";
const WHATSAPP_NAME = "Muhammad Irfanullah Khan";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export default function Contact() {
  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get in touch for any queries or assistance
            </p>
          </div>
        </AnimatedSection>
        <div className="grid md:grid-cols-2 gap-12">
          <AnimatedSection>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>WhatsApp</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-base font-semibold text-foreground">{WHATSAPP_NAME}</p>
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xl font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      {WHATSAPP_DISPLAY}
                    </a>
                  </div>
                  <Button
                    asChild
                    className="w-full bg-[#25D366] hover:bg-[#1ebe57] text-white"
                  >
                    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                      Chat on WhatsApp
                    </a>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>📧 Email</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">info@tandttravelandtours.com</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>📍 Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Office# 18, Sohni Shopping Mall, 2nd Floor, Main Karimabad, Karachi, Pakistan</p>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Your message..." rows={5} />
                  </div>
                  <Button className="w-full" type="submit">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
