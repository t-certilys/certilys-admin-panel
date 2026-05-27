import { Suspense } from "react";
import InvitationConfirmation from "@/components/certilys-ui/authentication/invitation-confirmation";

export default function InvitationPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground animate-pulse">Chargement de votre invitation...</div>}>
      <InvitationConfirmation />
    </Suspense>
  );
}
