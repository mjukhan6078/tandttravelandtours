import type { Metadata } from "next";
import { ComingSoon } from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Facilities",
  description: "Facilities from T&T Travel and Tours — coming soon.",
};

export default function FacilitiesPage() {
  return (
    <ComingSoon
      title="Facilities"
      description="Our facilities overview is coming soon. Reach out for details about transport, medical support, and related services."
    />
  );
}
