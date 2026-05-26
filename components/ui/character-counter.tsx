"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CharacterCounterProps {
  currentLength: number;
  maxLength: number;
  className?: string;
}

export function CharacterCounter({
  currentLength,
  maxLength,
  className,
}: CharacterCounterProps) {
  const remaining = maxLength - currentLength;
  const isNearLimit = remaining <= 10;
  const isAtLimit = remaining <= 0;

  return (
    <div className={cn("flex justify-end text-xs", className)}>
      <span
        className={cn(
          "text-muted-foreground",
          isNearLimit && !isAtLimit && "text-yellow-600 dark:text-yellow-500",
          isAtLimit && "text-destructive"
        )}
      >
        {currentLength}/{maxLength}
      </span>
    </div>
  );
}
