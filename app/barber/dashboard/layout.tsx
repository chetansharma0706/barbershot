// app/(dashboard)/barber/layout.tsx
import React from "react";
import { Scissors } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { DashboardContextProvider } from "./dashboardContext";
import Image from "next/image";
import DashboardNav from "@/components/DashboardNav";
import UserDropdown from "@/components/userDropdown";

export default async function BarberDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: shop, error } = await supabase
    .from("barber_shops")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !shop) notFound();

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-border bg-muted sticky top-0 h-screen">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
          {shop.logo_url ? (
            <img
              src={shop.logo_url}
              alt="shop logo"
              width={36}
              height={36}
              className="rounded-full aspect-square object-cover"
            />
          ) : (
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <Scissors className="h-5 w-5" />
            </div>
          )}
          <span className="font-semibold text-lg">{shop.shop_name}</span>
        </div>

        <DashboardNav isMobile={false} />

        {/* Desktop User Dropdown */}
        <div className="border-t border-border p-4">
          <UserDropdown profile={profile} email={user.email} isMobile={false} />
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 flex items-center justify-between px-4 border-b border-border bg-background sticky top-0 z-20">
          <div className="flex items-center gap-2 font-semibold">
            {shop.logo_url ? (
              <img
                src={shop.logo_url}
                alt="shop logo"
                width={32}
                height={32}
                className="rounded-full aspect-square object-cover"
              />
            ) : (
              <Scissors className="h-5 w-5 text-primary" />
            )}
            <span>{shop.shop_name}</span>
          </div>

          {/* Mobile User Dropdown */}
          <UserDropdown profile={profile} email={user.email} isMobile={true} />
        </header>

        <DashboardContextProvider shop={shop} profile={profile}>
          {children}
        </DashboardContextProvider>
      </main>

      <DashboardNav isMobile />
    </div>
  );
}