import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | T&T Travel",
  description: "Manage client trips, documents, and API keys",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_175)] text-foreground">
      {children}
    </div>
  );
}
