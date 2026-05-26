"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffIcon, LockKeyIcon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";

export interface PasswordInputProps extends React.ComponentProps<"input"> {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div
        className={cn(
          "flex h-8 items-center overflow-hidden rounded-lg border border-input bg-transparent transition-colors focus-within:border-ring dark:bg-input/30",
          className,
        )}
      >
        <div className="flex items-center justify-center pl-2.5 text-muted-foreground">
          <HugeiconsIcon icon={LockKeyIcon} size={16} strokeWidth={1.5} />
        </div>

        <input
          {...props}
          ref={ref}
          type={showPassword ? "text" : "password"}
          className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />

        <div className="h-4 w-px shrink-0 bg-border" />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          tabIndex={-1}
          className="flex h-full cursor-pointer items-center justify-center px-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <HugeiconsIcon
            icon={showPassword ? ViewOffIcon : ViewIcon}
            size={16}
            strokeWidth={1.5}
          />
          <span className="sr-only">
            {showPassword
              ? "Masquer le mot de passe"
              : "Afficher le mot de passe"}
          </span>
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
