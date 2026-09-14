import type { Metadata } from "next";
import { ComingSoon } from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Our Team",
  description: "Meet the T&T Travel and Tours team — coming soon.",
};

export default function OurTeamPage() {
  return (
    <ComingSoon
      title="Our Team"
      description="Team profiles are coming soon."
    />
  );
}
