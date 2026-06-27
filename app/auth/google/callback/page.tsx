"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { completeGoogleCallbackAction } from "@/lib/auth-actions";

export default function AdminGoogleCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AdminGoogleCallbackContent />
    </Suspense>
  );
}

function AdminGoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let active = true;

    async function complete() {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      if (!code || !state) {
        router.replace("/auth/login?error=Connexion%20Google%20impossible.");
        return;
      }

      const response = await completeGoogleCallbackAction(code, state);
      if (!active) return;

      if (!response.success) {
        router.replace(
          `/auth/login?error=${encodeURIComponent(response.message || "Connexion Google impossible.")}`,
        );
        return;
      }

      if (response.status === "REQUIRES_2FA_SETUP") {
        router.replace("/auth/2fa/setup");
        return;
      }

      if (response.status === "REQUIRES_2FA") {
        router.replace(
          `/auth/2fa?challengeId=${encodeURIComponent(response.challengeId || "admin-2fa")}`,
        );
        return;
      }

      router.replace(response.redirectTo || "/dashboard");
    }

    void complete();

    return () => {
      active = false;
    };
  }, [router, searchParams]);

  return null;
}
