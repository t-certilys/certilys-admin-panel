import { Suspense } from "react";
import TwoFactorForm from "@/components/certilys-ui/authentication/two-factor-form";

export default function TwoFactorPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground animate-pulse">Chargement de la page de sécurité...</div>}>
      <TwoFactorForm />
    </Suspense>
  );
}
