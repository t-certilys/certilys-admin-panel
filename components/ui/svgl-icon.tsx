"use client";

import useSWR from "swr";
import { cn } from "@/lib/utils";

/**
 * Fetcher pour récupérer le contenu brut d'un SVG depuis l'API SVGL.
 */
const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch SVG");
    return res.text();
  });

interface SvglIconProps {
  /** Nom du fichier sur SVGL (ex: "google.svg") */
  filename: string;
  /** Taille de l'icône en pixels (défaut: 32) */
  size?: number;
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Composant SvglIcon
 * Charge dynamiquement un SVG depuis l'API SVGL et l'injecte en inline.
 */
export const SvglIcon = ({ filename, size, className }: SvglIconProps) => {
  const {
    data: svgContent,
    error,
    isLoading,
  } = useSWR(`https://api.svgl.app/svg/${filename}`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 3600000, // 1 heure de cache local
  });

  // Gestion des états de chargement et d'erreur silencieuse
  if (isLoading || error || !svgContent) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 bg-muted/20 animate-pulse rounded-sm",
          !size && "size-8",
          className,
        )}
        style={size ? { width: size, height: size } : undefined}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        !size && "size-8",
        className,
      )}
      style={{
        ...(size ? { width: size, height: size } : {}),
        display: "inline-flex",
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

/**
 * Exemple d'usage concret : Logo Google
 */
export const GoogleLogo = (props: Omit<SvglIconProps, "filename">) => (
  <SvglIcon filename="google.svg" {...props} />
);

export default SvglIcon;
