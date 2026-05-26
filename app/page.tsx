import { Suspense } from "react";

import InvitationConfirmation from "@/components/certilys-ui/authentication/invitation-confirmation";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <InvitationConfirmation />
    </Suspense>
  );
}
