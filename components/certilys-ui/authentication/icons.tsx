"use client";

import React from "react";
import { SvglIcon } from "@/components/ui/svgl-icon";

interface GoogleLogoProps extends React.ComponentPropsWithoutRef<"span"> {
  /** Taille de l'icône en pixels */
  size?: number;
}

/**
 * Composant GoogleLogo réutilisant SvglIcon pour éviter la redondance.
 * Extrait du fichier d'icônes d'authentification pour utiliser l'API SVGL.
 */
export const GoogleLogo = ({ className, size, ...props }: GoogleLogoProps) => {
  return (
    <SvglIcon 
      filename="google.svg" 
      size={size} 
      className={className} 
      {...props} 
    />
  );
};

export default GoogleLogo;
