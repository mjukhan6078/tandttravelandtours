import type { Metadata } from "next";
import { ComingSoon } from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Hajj Packages 2026",
  description: "Hajj Packages 2026 from T&T Travel and Tours — coming soon.",
};

export default function HajjPackagesPage() {
  return (
    <ComingSoon
      title="Hajj Packages 2026"
      description="Detailed Hajj package listings are coming soon. Contact us for current availability and pricing."
    />
  );
}
