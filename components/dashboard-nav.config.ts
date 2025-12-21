// dashboard-nav.config.ts
import {
  Home,
  Calendar,
  // Users,
  // Bell,
  Settings,
  Armchair
} from "lucide-react";

export const DASHBOARD_NAV = [
  {
    label: "Dashboard",
    href: "/barber/dashboard",
    icon: Home,
  },
  {
    label: "Schedule",
    href: "/barber/dashboard/schedule",
    icon: Calendar,
  },
  {
    label: "Chairs",
    href: "/barber/dashboard/chairs",
    icon: Armchair,
  },
  // {
  //   label: "Notifications",
  //   href: "/barber/dashboard/notifications",
  //   icon: Bell,
  // },
  {
    label: "Settings",
    href: "/barber/dashboard/settings",
    icon: Settings,
  },
];
