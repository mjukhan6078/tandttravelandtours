import type { Metadata } from "next";
import { ComingSoon } from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Our CEO",
  description: "Meet the CEO of T&T Travel and Tours — coming soon.",
};

export default function OurCeoPage() {
  return (
    <ComingSoon
      title="Our CEO"
      description="Leadership profile coming soon."
    />
  );
}
