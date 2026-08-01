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
    <div className="min-h-screen">
      <header className="border-b border-border/70 bg-background/90 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-primary">
              <LayoutDashboard className="h-4 w-4" />
              <span className="truncate">T&T Dashboard</span>
            </Link>
            <span className="text-muted-foreground hidden sm:inline">/</span>
            <h1 className="text-sm sm:text-base font-medium truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
