import { Home, Calendar, Users, Bell, Settings, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'BarberBro Dashboard',
  description: 'Barber dashboard for managing bookings and clients',
};

const navLinks = [
  { id: 'home', icon: Home, label: 'Home', href: '/dashboard' },
  { id: 'calendar', icon: Calendar, label: 'Schedule', href: '/dashboard/schedule' },
  { id: 'clients', icon: Users, label: 'Clients', href: '/dashboard/clients' },
  { id: 'notifications', icon: Bell, label: 'Alerts', href: '/dashboard/notifications' },
  { id: 'settings', icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">

      {/* SIDEBAR for Desktop */}
      <aside className="hidden md:flex w-72 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
              <Image className="object-cover" width={50} height={50} src="/android-chrome-192x192.png" alt="BarberBro Logo" />
            </div>
            <span>BarberBro</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {navLinks.map(({ id, icon: Icon, label, href }) => (
            <Link key={id} href={href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-[hsl(var(--muted))]/20 transition">
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col">

        {/* Header - Desktop */}
        <header className="hidden md:flex h-16 items-center justify-between px-8 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="flex gap-2">
            <button className="h-9 w-9 rounded-full border bg-[hsl(var(--input))] hover:bg-[hsl(var(--muted))]/40">
              <Bell className="h-4 w-4 mx-auto" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>

        {/* MOBILE BOTTOM NAV */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] md:hidden">
          {navLinks.map(({ id, icon: Icon, label, href }) => (
            <Link key={id} href={href} className="flex flex-col items-center justify-center text-[10px] font-medium">
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
