// dashboard-nav.config.ts
import {
  Home,
  Calendar,
  // Users,
  Bell,
  Settings
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
  // {
  //   label: "Clients",
  //   href: "/barber/dashboard/clients",
  //   icon: Users,
  // },
  {
    label: "Notifications",
    href: "/barber/dashboard/notifications",
    icon: Bell,
  },
  {
    label: "Settings",
    href: "/barber/dashboard/settings",
    icon: Settings,
  },
];
