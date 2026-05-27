"use client";

import { LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function NavUser({
  user,
  onLogout,
  compact = false,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  onLogout?: () => void;
  compact?: boolean;
}) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {compact ? (
          <div className="flex size-9 items-center justify-center">
            <Avatar className="h-9 w-9 rounded-full shrink-0">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-full bg-white/10 text-white font-semibold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
        <div className="flex items-center gap-2 rounded-xl bg-white/5 px-2 py-1.5">
          <Avatar className="h-8 w-8 rounded-lg shrink-0">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-lg bg-white/15 text-white font-semibold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
            <span className="truncate font-medium text-white/90">{user.name}</span>
            <span className="truncate text-xs text-white/50">
              {user.email}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="ml-auto shrink-0 size-7 text-white/50 hover:text-red-300 hover:bg-red-500/15"
            aria-label="Déconnexion"
          >
            <LogOut className="size-3.5" />
          </Button>
        </div>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
