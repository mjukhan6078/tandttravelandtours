import type { Metadata } from "next";
import { ComingSoon } from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Hajj Tarbiati Program Gallery",
  description: "Hajj Tarbiati Program gallery — coming soon.",
};

export default function HajjTarbiatiGalleryPage() {
  return (
    <ComingSoon
      title="Hajj Tarbiati Program"
      description="Training program photos are coming soon."
    />
  );
}
