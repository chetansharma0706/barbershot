// components/UserDropdown.tsx
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, User, MoreHorizontal, Loader2 } from "lucide-react";
import Image from "next/image";
import { useTransition } from "react";
import { signOutAction } from "@/app/actions/signOut";

interface UserDropdownProps {
  profile: any;
  email: string | undefined;
  isMobile?: boolean; // Controls appearance (Icon vs Full Row)
}

export default function UserDropdown({ profile, email, isMobile = false }: UserDropdownProps) {
  const [isPending, startTransition] = useTransition();

  // Helper functions moved inside
  function truncateText(text: string | undefined, maxLength: number) {
    if (!text) return "";
    return text.length <= maxLength ? text : text.slice(0, maxLength) + "...";
  }

  function nameToQuery(name: string) {
    return name.trim().toLowerCase().split(/\s+/).join("+");
  }

  const avatarUrl =
    profile?.avatar_url ||
    `https://ui-avatars.com/api/?lenght=1&background=1a1a1a&color=f5c77a&size=128&bold=true&name=${nameToQuery(
      profile?.full_name || "Barber"
    )}`;

  // 1. Define the Mobile Trigger (Just the Avatar)
  const MobileTrigger = (
    <button className="outline-none rounded-full focus:ring-2 focus:ring-primary focus:ring-offset-2">
      <Image
        src={avatarUrl}
        alt="User Avatar"
        width={32}
        height={32}
        className="rounded-full aspect-square object-cover border border-gold"
      />
    </button>
  );

  // 2. Define the Desktop Trigger (Full Info Row)
  const DesktopTrigger = (
    <Button
      variant="ghost"
      className="w-full flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:bg-muted transition h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
    >
      <Image
        src={avatarUrl}
        alt="User Avatar"
        width={32}
        height={32}
        className="rounded-full aspect-square object-cover border border-gold"
      />
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-medium truncate">{profile?.full_name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {truncateText(email, 25)}
        </p>
      </div>
      <MoreHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isMobile ? MobileTrigger : DesktopTrigger}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Account Info</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        
        {/* LOGOUT BUTTON WITH LOADING STATE */}
        <DropdownMenuItem
          onClick={(e) => {
            // Prevent the menu from closing immediately so user sees the spinner
            e.preventDefault(); 
            startTransition(async () => {
              await signOutAction();
            });
          }}
          disabled={isPending}
          className="text-red-500 focus:text-red-500 cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          <span>{isPending ? "Logging out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}