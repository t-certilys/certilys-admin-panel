"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface AddonInputProps extends Omit<React.ComponentProps<typeof Input>, "className"> {
  prefixAddon?: string;
  suffixAddon?: string;
  className?: string;
}

export function AddonInput({
  prefixAddon,
  suffixAddon,
  className,
  ...props
}: AddonInputProps) {
  return (
    <div className="relative">
      {prefixAddon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
          {prefixAddon}
        </span>
      )}
      <Input
        className={cn(
          prefixAddon && "pl-[calc(theme(spacing.3)+var(--prefix-length))",
          suffixAddon && "pr-[calc(theme(spacing.3)+var(--suffix-length))]",
          className
        )}
        style={
          prefixAddon
            ? ({ "--prefix-length": `${prefixAddon.length}ch` } as React.CSSProperties)
            : suffixAddon
            ? ({ "--suffix-length": `${suffixAddon.length}ch` } as React.CSSProperties)
            : undefined
        }
        {...props}
      />
      {suffixAddon && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
          {suffixAddon}
        </span>
      )}
    </div>
  );
}
