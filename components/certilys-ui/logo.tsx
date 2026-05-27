import Image from "next/image";
import { cn } from "@/lib/utils";
import { CtyIcon } from "@/components/icons/cty-i";

type LogoVariant = "auth" | "sidebar" | "collapsed";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  variant?: LogoVariant;
}

/**
 * Composant Logo réutilisable qui gère différentes variantes :
 * - auth : Logo principal pour les formulaires (cty-lvw/cty-lvb)
 * - sidebar : Logo complet pour la barre latérale (cty-lvw/cty-lvb)
 * - collapsed : Version icône seule pour la barre latérale rétractée (cty-i.svg)
 */
export const Logo = ({
  className,
  width,
  height,
  variant = "auth",
}: LogoProps) => {
  // Définition des dimensions par défaut selon la variante
  const defaultWidth =
    variant === "sidebar" ? 120 : variant === "auth" ? 64 : 32;
  const defaultHeight =
    variant === "sidebar" ? 40 : variant === "auth" ? 64 : 32;

  const w = width ?? defaultWidth;
  const h = height ?? defaultHeight;

  // Mapping des sources selon la variante
  // Mode sombre (Dark) -> lvb (White)
  // Mode clair (Light) -> lvw (Black)

  let darkSrc = "/images/logos/cty-lvb.svg";
  let lightSrc = "/images/logos/cty-lvw.svg";

  if (variant === "collapsed") {
    return (
      <div className={cn("relative flex items-center justify-center", className)}>
        <CtyIcon className="text-primary" width={w} height={h} />
      </div>
    );
  } else if (variant === "sidebar") {
    darkSrc = "/images/logos/cty-lvb.svg";
    lightSrc = "/images/logos/cty-lvw.svg";
  }

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Variante pour le mode sombre (Texte Blanc / lvw) */}
      <Image
        src={darkSrc}
        alt="Certilys Logo Dark"
        width={w}
        height={h}
        className="hidden dark:block object-contain"
        priority
      />
      {/* Variante pour le mode clair (Texte Noir / lvb) */}
      <Image
        src={lightSrc}
        alt="Certilys Logo Light"
        width={w}
        height={h}
        className="block dark:hidden object-contain"
        priority
      />
    </div>
  );
};
