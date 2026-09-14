import type { Metadata } from "next";
import { ComingSoon } from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Makkah & Madinah Gallery",
  description: "Makkah, Madinah, Mina and Arafat gallery — coming soon.",
};

export default function MakkahMadinahGalleryPage() {
  return (
    <ComingSoon
      title="Makkah / Madinah / Mina / Arafat"
      description="Destination photos are coming soon."
    />
  );
}
