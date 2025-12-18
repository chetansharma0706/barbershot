// app/(dashboard)/barber/layout.tsx
import React from "react";
import {
  Home,
  Calendar,
  Users,
  Settings,
  Bell,
  Plus,
  Scissors,
  MoreHorizontal
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { DashboardContextProvider } from "./dashboardContext";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import DashboardNav from "@/components/DashboardNav";

export default async function BarberDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: shop, error } = await supabase
    .from("barber_shops")
    .select("*")
    .eq("user_id", user.id) // Replace with actual user ID logic
    .single();

  if (error || !shop) {
    notFound();
  }


  function truncateText(text: string | undefined, maxLength: number) {
    if (!text || text === undefined) return "";

    if (text.length <= maxLength) {
      return text;
    }

    return text.slice(0, maxLength) + "...";
  }



  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r border-border bg-muted sticky top-0 h-screen">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
          {shop.logo_url ? (
            <Image
              src={shop.logo_url}
              alt="shop logo"
              width={36}
              height={36}
              className="rounded-full aspect-square object-cover"
              priority
            />
          ) : (
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <Scissors className="h-5 w-5" />
            </div>)}
          <span className="font-semibold text-lg">{shop.shop_name}</span>
        </div>

        {/* <nav className="flex-1 px-4 py-6 space-y-1">
          <NavItem icon={Home} label="Dashboard" />
          <NavItem icon={Calendar} label="Schedule" />
          <NavItem icon={Users} label="Clients" />
          <NavItem icon={Bell} label="Notifications" />
          <NavItem icon={Settings} label="Settings" />
        </nav> */}

        <DashboardNav isMobile={false} />

        <div className="border-t border-border p-4">
          <Button variant="ghost" className="w-full flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:bg-muted transition">
            <Image
              src={profile?.avatar_url || 'https://ui-avatars.com/api/?lenght=1&background=1a1a1a&color=f5c77a&size=128&bold=true&name=Barber+bro'}
              alt="User Avatar"
              width={32}
              height={32}
              className="rounded-full aspect-square object-cover border border-gold"
              priority
            />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">{profile?.full_name}</p>
              <p className="text-xs text-muted-foreground">{truncateText(profile?.email, 25)}</p>
            </div>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Mobile Header */}
        <header className="md:hidden h-16 flex items-center justify-between px-4 border-b border-border bg-background sticky top-0 z-20">
          <div className="flex items-center gap-2 font-semibold">
            {shop.logo_url ? (
              <Image
                src={shop.logo_url}
                alt="shop logo"
                width={32}
                height={32}
                className="rounded-full aspect-square object-cover"
                priority
              />
            ) : (
              <Scissors className="h-5 w-5 text-primary" />
            )}
            <span>{shop.shop_name}</span>
          </div>
          <Image
            src={profile?.avatar_url || 'https://ui-avatars.com/api/?lenght=1&background=1a1a1a&color=f5c77a&size=128&bold=true&name=Barber+bro'}
            alt="User Avatar"
            width={32}
            height={32}
            className="rounded-full aspect-square object-cover border border-gold"
            priority
          />
        </header>
        <DashboardContextProvider shop={shop} profile={profile}>
          {children}
        </DashboardContextProvider>
      </main>

      <DashboardNav isMobile />

      {/* Mobile Bottom Nav */}
      {/* Mobile Bottom Navigation */}
      {/* <nav className="
  md:hidden
  fixed bottom-0 left-0 right-0
  z-50
  bg-background
  border-t border-border
  px-4
  pb-safe
">
        <div className="
    h-16
    flex items-center justify-between
    max-w-md
    mx-auto
  ">
          <BottomNav icon={Home} label="Home" />
          <BottomNav icon={Calendar} label="Schedule" /> */}

          {/* Center Action */}
          {/* <div className="flex flex-col items-center -mt-6">
            <button className="
        h-14 w-14
        rounded-full
        bg-primary
        text-primary-foreground
        flex items-center justify-center
        border border-border
        shadow-[var(--shadow-subtle)]
        active:scale-95
        transition
      ">
              <Plus className="h-6 w-6" />
            </button>
            <span className="mt-1 text-[10px] text-muted-foreground">
              Book
            </span>
          </div> */}

          {/* <BottomNav icon={Users} label="Clients" />
          <BottomNav icon={Settings} label="Settings" />
        </div>
      </nav> */}

    </div>
  );
}

// function NavItem({ icon: Icon, label  }: any) {
//   return (
//     <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition">
//       <Icon className="h-4 w-4" />
//       {label}
//     </button>
//   );
// }

// function BottomNav({ icon: Icon, label }: any) {
//   return (
//     <button className="
//       flex flex-col items-center justify-center
//       gap-1
//       text-muted-foreground
//       hover:text-foreground
//       transition
//     ">
//       <Icon className="h-5 w-5" />
//       <span className="text-[10px] font-medium">
//         {label}
//       </span>
//     </button>
//   );
// }

