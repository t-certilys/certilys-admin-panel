import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps {
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2 | 3;
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid auto-rows-[180px] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function BentoCard({
  colSpan = 1,
  rowSpan = 1,
  children,
  className,
}: BentoCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-(--radius) border border-border bg-card p-4 shadow-none",
        className,
      )}
      style={{
        gridColumn: `span ${colSpan} / span ${colSpan}`,
        gridRow: `span ${rowSpan} / span ${rowSpan}`,
      }}
    >
      {children}
    </div>
  );
}
