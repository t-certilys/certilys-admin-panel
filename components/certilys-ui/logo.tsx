import Image from "next/image";
import { cn } from "@/lib/utils";
import { CtyIcon } from "@/components/icons/cty-i";

type LogoVariant = "auth" | "sidebar" | "collapsed";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  variant?: LogoVariant;
  themeOverride?: "dark" | "light";
}

/**
 * Composant Logo réutilisable qui gère différentes variantes :
 * - auth : Logo principal pour les formulaires
 * - sidebar : Logo complet pour la barre latérale
 * - collapsed : Version icône seule pour la barre latérale rétractée
 */
export const Logo = ({
  className,
  width,
  height,
  variant = "auth",
  themeOverride,
}: LogoProps) => {
  const defaultWidth =
    variant === "sidebar" ? 120 : variant === "auth" ? 64 : 32;

  const defaultHeight =
    variant === "sidebar" ? 40 : variant === "auth" ? 64 : 32;

  const w = width ?? defaultWidth;
  const h = height ?? defaultHeight;

  if (variant === "collapsed") {
    return (
      <div
        className={cn("relative flex items-center justify-center", className)}
      >
        <CtyIcon className="text-primary" width={w} height={h} />
      </div>
    );
  }

  const darkSrc =
    variant === "sidebar"
      ? "/images/logos/cty-lvw.svg"
      : "/images/logos/cty-lvb.svg";

  const lightSrc =
    variant === "sidebar"
      ? "/images/logos/cty-lvb.svg"
      : "/images/logos/cty-lvw.svg";

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <Image
        src={darkSrc}
        alt="Certilys Logo Dark"
        width={w}
        height={h}
        className={cn(
          "object-contain w-auto h-auto",
          themeOverride === "dark"
            ? "block"
            : themeOverride === "light"
              ? "hidden"
              : "hidden dark:block",
        )}
        style={{ width: "auto", height: "auto" }}
        priority
      />

      <Image
        src={lightSrc}
        alt="Certilys Logo Light"
        width={w}
        height={h}
        className={cn(
          "object-contain w-auto h-auto",
          themeOverride === "light"
            ? "block"
            : themeOverride === "dark"
              ? "hidden"
              : "block dark:hidden",
        )}
        style={{ width: "auto", height: "auto" }}
        priority
      />
    </div>
  );
};
