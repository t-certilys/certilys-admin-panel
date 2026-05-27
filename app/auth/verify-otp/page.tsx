import { Suspense } from "react";
import VerifyOTP from "@/components/certilys-ui/authentication/verify-otp";

export const metadata = {
  title: "Verify OTP | Murgo",
  description: "Enter the 6-digit code sent to your email to verify your identity.",
};

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground animate-pulse">Chargement de la page de vérification...</div>}>
      <VerifyOTP />
    </Suspense>
  );
}
