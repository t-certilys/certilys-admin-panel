"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { completeGoogleCallbackAction } from "@/lib/auth-actions";

export default function AdminGoogleCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    async function complete() {
      const response = await completeGoogleCallbackAction();
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
  }, [router]);

  return null;
}
