"use client";

import {
  Notification01Icon,
  NotificationOff01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const notificationItems = [
  {
    title: "New account activity",
    detail: "3 team members signed in today.",
  },
  {
    title: "Weekly report ready",
    detail: "Your analytics summary is available.",
  },
  {
    title: "Billing reminder",
    detail: "Your next invoice is scheduled this week.",
  },
];

export function HeaderNotifications() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex size-10 items-center justify-center rounded-full text-foreground/85 transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:border focus-visible:border-ring focus-visible:outline-none"
          aria-label="Open notifications"
        >
          <HugeiconsIcon
            icon={Notification01Icon}
            size={20}
            strokeWidth={1.5}
          />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-primary" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-w-[calc(100vw-2rem)]"
      >
        <DropdownMenuLabel className="px-3 py-2 text-sm font-medium text-foreground">
          Notifications
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notificationItems.map((item) => (
          <DropdownMenuItem
            key={item.title}
            className="flex flex-col items-start gap-1 px-3 py-2"
          >
            <span className="text-sm font-medium text-foreground">
              {item.title}
            </span>
            <span className="text-xs text-muted-foreground">{item.detail}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="px-3 py-2 text-muted-foreground">
          <HugeiconsIcon
            icon={NotificationOff01Icon}
            size={20}
            strokeWidth={1.5}
          />
          Mark all as read
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
