import TopBar from "@/components/TopBar";
import { InquireProvider } from "@/components/site/InquireContext";
import InquirePanel from "@/components/site/InquirePanel";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InquireProvider>
      <div className="sticky top-0 z-40">
        <TopBar />
        <SiteHeader />
      </div>
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <InquirePanel />
    </InquireProvider>
  );
}
