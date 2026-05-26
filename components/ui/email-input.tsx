"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";

export interface EmailInputProps extends React.ComponentProps<"input"> {}

const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex h-8 items-center overflow-hidden rounded-lg border border-input bg-transparent transition-colors focus-within:border-ring dark:bg-input/30",
          className,
        )}
      >
        <div className="flex items-center justify-center pl-2.5 text-muted-foreground">
          <HugeiconsIcon icon={Mail01Icon} size={16} strokeWidth={1.5} />
        </div>

        <input
          {...props}
          ref={ref}
          type="email"
          className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
      </div>
    );
  },
);
EmailInput.displayName = "EmailInput";

export { EmailInput };
