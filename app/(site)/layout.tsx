import TopBar from "@/components/TopBar";
import FloatingActions from "@/components/site/FloatingActions";
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
      <TopBar />
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <FloatingActions />
      <InquirePanel />
    </InquireProvider>
  );
}
