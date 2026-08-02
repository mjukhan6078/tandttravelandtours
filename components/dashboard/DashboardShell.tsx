"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard } from "lucide-react";

export default function DashboardShell({
  title,
  children,
  actions,
}: {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/dashboard/logout", { method: "POST" });
    router.push("/dashboard/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden">
      <header className="border-b border-border/70 bg-background/90 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-3 sm:px-4 py-2.5 sm:h-14 sm:py-0 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 sm:gap-2 font-semibold text-primary shrink-0"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="text-sm sm:text-base">
                <span className="sm:hidden">T&T</span>
                <span className="hidden sm:inline">T&T Dashboard</span>
              </span>
            </Link>
            <span className="text-muted-foreground hidden sm:inline shrink-0">/</span>
            <h1 className="text-sm sm:text-base font-medium truncate min-w-0">{title}</h1>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {actions}
            <Button variant="outline" size="sm" onClick={logout} aria-label="Logout">
              <LogOut className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-8 min-w-0">{children}</main>
    </div>
  );
}
