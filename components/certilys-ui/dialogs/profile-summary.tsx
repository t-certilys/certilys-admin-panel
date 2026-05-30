"use client";

import { cn } from "@/lib/utils";

export type ProfileStatusTone =
  | "pending"
  | "active"
  | "approved"
  | "success"
  | "rejected"
  | "suspended"
  | "danger"
  | "info"
  | "correction"
  | string;

export interface ProfileSummaryProps {
  name: string;
  email?: string;
  subtitle?: string;
  initials?: string;
  avatarUrl?: string | null;
  status?: ProfileStatusTone;
  size?: "sm" | "md";
  className?: string;
}

const statusDotClass = (status?: ProfileStatusTone) => {
  const normalized = String(status ?? "info").toLowerCase();
  if (["active", "approved", "success", "enabled"].some((key) => normalized.includes(key))) {
    return "bg-emerald-500";
  }
  if (["rejected", "suspended", "revoked", "danger", "blocked", "delete"].some((key) => normalized.includes(key))) {
    return "bg-red-500";
  }
  if (["pending", "submitted", "waiting"].some((key) => normalized.includes(key))) {
    return "bg-orange-500";
  }
  return "bg-blue-500";
};

const fallbackInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

export function ProfileSummary({
  name,
  email,
  subtitle,
  initials,
  avatarUrl,
  status,
  size = "md",
  className,
}: ProfileSummaryProps) {
  const isSmall = size === "sm";

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <div className="relative shrink-0">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className={cn(
              "rounded-full object-cover ring-1 ring-border/60",
              isSmall ? "size-9" : "size-12",
            )}
          />
        ) : (
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ring-1 ring-border/60",
              isSmall ? "size-9 text-xs" : "size-12 text-sm",
            )}
          >
            {initials || fallbackInitials(name)}
          </div>
        )}
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-background",
            isSmall ? "size-2.5" : "size-3",
            statusDotClass(status),
          )}
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground" title={name}>
          {name}
        </p>
        {(email || subtitle) && (
          <p className="truncate text-xs text-muted-foreground" title={email || subtitle}>
            {email || subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
