"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { DASHBOARD_NAV } from "./dashboard-nav.config";

export default function DashboardNav({ isMobile }: { isMobile?: boolean }) {
  const pathname = usePathname();

  return (
    <>
    {isMobile ? (
          <nav
        className="
          lg:hidden
          fixed bottom-0 left-0 right-0
          z-50
          bg-background
          border-t border-border
          px-4
          pb-safe
        "
      >
        <div className="h-16 flex items-center justify-between max-w-md mx-auto">
          {DASHBOARD_NAV.map((item) => {
            const isActive =
              pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex flex-col items-center justify-center gap-1 transition",
                  isActive
                    ? "text-gold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    ) : (
      <nav className="hidden lg:flex flex-1 px-4 py-6 space-y-1 flex-col">
        {DASHBOARD_NAV.map((item) => {
          const isActive =
            pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

    )}    
    </>
  );
}
