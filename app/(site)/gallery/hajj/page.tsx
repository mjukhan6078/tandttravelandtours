import type { Metadata } from "next";
import { ComingSoon } from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Hajj Gallery",
  description: "Hajj gallery — coming soon.",
};

export default function HajjGalleryPage() {
  return (
    <ComingSoon
      title="Hajj Gallery"
      description="Hajj photos are coming soon."
    />
  );
}
