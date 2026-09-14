import type { Metadata } from "next";
import { ComingSoon } from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Guest House Gallery",
  description: "Guest house gallery — coming soon.",
};

export default function GuestHouseGalleryPage() {
  return (
    <ComingSoon
      title="Guest House"
      description="Guest house photos and details are coming soon."
    />
  );
}
